/**
 * Created by binwang on 17/8/26.
 */
import {Path} from '@util';
export default {
    actions: {
        choose: {
        }, get: {
            method: 'get',
            url: (payload) => `${Path.uc}/teams/${payload.id}`
        },
        list: {
            method: 'get',
            url: (payload) => `${Path.uc}/teams`
        },
        all: {
            method: 'get',
            url: (payload) => `${Path.uc}/teams`
        },
        save: {
            method: 'post',
            url: (payload) => `${Path.uc}/teams`
        },
        update: {
            method: 'put',
            url: (payload) => `${Path.uc}/teams/${payload.id}`,
        },
        delete: {
            method: 'delete',
            url: (payload) => `${Path.uc}/teams/${payload.id}`,
        },
        external_visibility:{
            method: 'put',
            url:(payload) => `${Path.uc}/teams/${payload.id}/external_visibility`,
        },
        team_users:{
            method: 'get',
            url:(payload) => `${Path.uc}/teams/${payload.id}/users`,
        },
        team_escalationpolicies:{
            method: 'get',
            url:(payload) => `${Path.uc}/teams/${payload.id}/escalationPolicies`,
        },
        team_services:{
            method: 'get',
            url:(payload) => `${Path.uc}/teams/${payload.id}/services`,
        },
        team_schedules:{
            method: 'get',
            url:(payload) => `${Path.uc}/teams/${payload.id}/schedules`,
        },
        change_role:{
            method: 'put',
            url:(payload) => `${Path.uc}/teams/${payload.id}/users/${payload.userId}/roles/${payload.roleId}`
        },
        remove_escalation_policy:{
            method: 'delete',
            url:(payload) => `${Path.uc}/teams/${payload.id}/escalation_policies/${payload.escalation_policy_id}`
        }
    },
}