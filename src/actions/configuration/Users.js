/**
 * Created by binwang on 17/8/26.
 */
import _ from 'lodash';
import {MockPath} from '@util';
import store from 'store';

export default {
    actions: {
        // user begin
        login: {
            key: 'authUser',
            method: 'post',
            url: (payload) => `${MockPath.auth}/${payload.accountKey}/login`,
            //url: (payload) => `mock/${payload.accountKey}/login`
        },
        loginUser: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users/${payload.id}`
        },
        me: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users/${payload.id}`
        },
        get: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users/${payload.id}`
        },
        refresh_token: {
            method: 'get',
            url: (payload) => `${MockPath.auth}/refreshtoken`,
        },
        current: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users/${payload.id}`
        },
        list: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users`
        },

        all: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users`
        },
        save: {
            method: 'post',
            url: (payload) => `${MockPath.uc}/users`
        },
        update: {
            method: 'put',
            url: (payload) => `${MockPath.uc}/users/${payload.id}`,
        },
        delete: {
            method: 'delete',
            url: (payload) => `${MockPath.uc}/users/${payload.id}`,
        },
        update_password: {
            method: 'put',
            key: 'authUser',
            url: (payload) => `${MockPath.auth}/accounts/${payload.accountKey}/users/${payload.id}/actions/modify`
        },
        functions: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users/${payload.id}/functions`
        },
        // user end


        // contact_methods begin
        contact_methods_list: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/contact_methods`
        },
        contact_methods_save: {
            method: 'post',
            key: 'contact_method',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/contact_methods`
        },
        contact_methods_update: {
            method: 'put',
            key: 'contact_method',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/contact_methods/${payload.id}`
        },
        contact_methods_delete: {
            method: 'delete',
            key: 'contact_method',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/contact_methods/${payload.id}`
        },
        contact_methods_get: {
            method: 'get',
            key: 'contact_method',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/contact_methods/${payload.id}`
        },
        // contact_methods end


        // notification_rules begin
        notification_rules_list: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/notification_rules`
        },
        notification_rules_save: {
            method: 'post',
            key: 'notification_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/notification_rules`
        },
        notification_rules_update: {
            method: 'put',
            key: 'notification_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/notification_rules/${payload.id}`
        },
        notification_rules_delete: {
            method: 'delete',
            key: 'notification_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/notification_rules/${payload.id}`
        },
        notification_rules_get: {
            method: 'get',
            key: 'notification_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/notification_rules/${payload.id}`
        },
        // notification_rules end

        // incident_status_change_rule begin
        incident_status_change_rules_list: {
            method: 'get',
            key: 'incident_status_change_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/incident_status_change_rules`
        },
        incident_status_change_rules_save: {
            method: 'post',
            key: 'incident_status_change_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/incident_status_change_rules`
        },
        incident_status_change_rules_update: {
            method: 'put',
            key: 'incident_status_change_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/incident_status_change_rules/${payload.id}`
        },
        incident_status_change_rules_delete: {
            method: 'delete',
            key: 'incident_status_change_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/incident_status_change_rules/${payload.id}`
        },
        incident_status_change_rules_get: {
            method: 'get',
            key: 'incident_status_change_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/incident_status_change_rules/${payload.id}`
        },
        // incident_status_change_rule end


        // oncall_handoff_rules begin
        oncall_handoff_rules_list: {
            method: 'get',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/oncall_handoff_rules`
        },
        oncall_handoff_rules_save: {
            method: 'post',
            key: 'oncall_handoff_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/oncall_handoff_rules`
        },
        oncall_handoff_rules_update: {
            method: 'put',
            key: 'oncall_handoff_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/oncall_handoff_rules/${payload.id}`
        },
        oncall_handoff_rules_delete: {
            method: 'delete',
            key: 'oncall_handoff_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/oncall_handoff_rules/${payload.id}`
        },
        oncall_handoff_rules_get: {
            method: 'get',
            key: 'oncall_handoff_rule',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/oncall_handoff_rules/${payload.id}`
        },
        // oncall_handoff_rules end

        check_base_role: {
            method: 'post',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/baseroles`
        },


        //additional_permission start
        my_additional_permission: {
            method: 'get',
            //key:'',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/permissions`,
            format: (response) => {
                if (response.data.roleMap) {
                    let permissions = {};
                    _.forEach(_.keys(response.data.roleMap), key => {
                        permissions[key] = response.data.roleMap[key].idMap;
                    })
                    permissions['functions'] = response.data.permissions;
                    store.set('permissions', permissions);
                    return {data: permissions};
                } else {
                    return store.get('permissions');
                }
            }
        },
        additional_permission_get: {
            method: 'get',
            //key:'',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/additionalpermissions`
        },
        additional_permission_save: {
            method: 'post',
            key: '',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/additionalpermissions`
        },
        additional_permission_update: {
            method: 'put',
            key: '',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/additionalpermissions`
        },
        additional_permission_delete: {
            method: 'delete',
            key: '',
            url: (payload) => `${MockPath.uc}/users/${payload.userId}/additionalpermissions`
        }
    },
    // state: {},
    // mutations: {},
    getters: {
        allUserOptions: (state, getters) => {
            if (_.get(state, 'all.data.list', null) === null)
                return [];
            return _.map(state.all.data.list, user => {
                return {
                    label: user.name,
                    value: user.id,
                };
            });
        },
        permissions: (state, getters) => {
            if(_.get(state.my_additional_permission,'data.functions',false)) {
                return state.my_additional_permission.data;
            }else
                return store.get('permissions');
        },
        functions: (state, getters) => {
            return getters.permissions.functions;
        },
    }
};