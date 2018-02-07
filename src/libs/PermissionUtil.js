/**
 * Created by binwang on 17/11/10.
 */
import  store from 'store';
import  _ from 'lodash';
import  Vue from 'vue';

let getPemission = (role, scope, id) => {
    return _.includes(_.get(store.get('permissions'), `${role}.${scope}`, []), id);
}
const PermissionUtil = {
    incident: {
        assignToMe: (incident) => {
            return _.get(incident, 'assignments[0].assignee.id') === store.get('id');
        },
        respondToMe: (incident) => {
            let isMe = false;
            _.get(incident, 'responder_requests', []).forEach(request => {
                _.forEach(request.incidents_responders, responder => {
                    if (responder.user.id === store.get('id')) {

                        isMe = true;
                    }
                });
            })
            return isMe;
        },
    },
    service: {
        isManager: ({id = -999}) => {
            return getPemission('manager', 'service', id);
        },
        isResponder: ({id = -999}) => {
            return getPemission('responder', 'service', id);
        },
        isObserver: ({id = -999}) => {
            return getPemission('observer', 'service', id);
        },
        allowView: ({id = -999}) => {
            if (PermissionUtil.role.isRestrict() && !PermissionUtil.service.isManager({id: id}) && !PermissionUtil.service.isResponder({id: id}) && !PermissionUtil.service.isObserver({id: id})) {
                return false;
            } else
                return true;
        },
        allowEdit: ({id = -999}) => {
            if (PermissionUtil.role.isAdmin()
                || PermissionUtil.role.isManager()
                || PermissionUtil.service.isManager({id})
                || PermissionUtil.service.isResponder({id})
            ) {
                return true;
            } else
                return false;
        },
    },
    schedule: {
        isManager: ({id = -999}) => {
            return getPemission('manager', 'schedule', id);
        },
        isResponder: ({id = -999}) => {
            return getPemission('responder', 'schedule', id);
        },
        isObserver: ({id = -999}) => {
            return getPemission('observer', 'schedule', id);
        },
        isOwner: (id) => {
            let list = store.get('schedule_list');
            if (list) {
                return _.includes(list, id);
            } else
                return false;
        },
        allowView: ({id = -999}) => {
            if (PermissionUtil.role.isRestrict() && !PermissionUtil.schedule.isOwner(id) && !PermissionUtil.schedule.isManager({id: id})  && !PermissionUtil.schedule.isResponder({id: id}) && !PermissionUtil.schedule.isObserver({id: id}) ) {
                return false;
            } else{
                return true;
            }
        },
        allowEdit: ({id = -999}) => {
            if (
                PermissionUtil.role.isAdmin()
                || PermissionUtil.role.isManager()
                || PermissionUtil.schedule.isOwner(id)
                || PermissionUtil.schedule.isManager({id})
            ) {
                return true;
            } else
                return false;
        }
    },
    escalationPolicy: {
        isManager: ({id = -999}) => {
            return getPemission('manager', 'escalationPolicy', id);
        },
        isResponder: ({id = -999}) => {
            return getPemission('responder', 'escalationPolicy', id);
        },
        isObserver: ({id = -999}) => {
            return getPemission('observer', 'escalationPolicy', id);
        },
        isOwner: (escalationPolicy) => {
            let uId = store.get('id');
            let isOwner = false;
            _.forEach(escalationPolicy.escalation_rules, rule => {
                _.forEach(rule.targets, target => {
                    if (target.type === 'user_reference' && target.id === uId) {
                        isOwner = true;
                    } else if (target.type === 'schedule_reference') {
                        isOwner = PermissionUtil.schedule.isOwner(target.id);
                    }
                });
            });
            return isOwner;
        },
        allowView: ({id = -999}) => {
            if (PermissionUtil.role.isRestrict() && !PermissionUtil.escalationPolicy.isOwner(id) && !PermissionUtil.escalationPolicy.isManager({id: id})  && ! PermissionUtil.escalationPolicy.isResponder({id: id}) && !PermissionUtil.escalationPolicy.isObserver({id: id}) ) {
                return false;
            } else
                return true;
        },
        allowEdit: ({id = -999}) => {
            if (
                PermissionUtil.role.isAdmin()
                || PermissionUtil.role.isManager()
                || PermissionUtil.escalationPolicy.isOwner(id)
                || PermissionUtil.escalationPolicy.isManager({id})
                || PermissionUtil.escalationPolicy.isResponder({id})
            ) {
                return true;
            } else
                return false;
        },
    },
    role: {
        get: () => {
            return !!Vue.config.role && Vue.config.role || store.get('role');  
        },
        isRestrict: () => {
            return PermissionUtil.role.get() === 'restricted_access';
        },
        isObserver: () => {
            return PermissionUtil.role.get() === 'observer';
        },
        isAdmin: () => {
            return PermissionUtil.role.get() === 'owner';
        },
        isManager: () => {
            return PermissionUtil.role.get() === 'manager';
        },
    }
}

export default PermissionUtil;