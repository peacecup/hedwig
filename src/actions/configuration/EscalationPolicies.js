import {Path} from '@util';
export default {
    actions: {
        get: {
            method: 'get',
            url: (payload) => `${Path.engine}/escalation_policies/${payload.id}`
        },
        list: {
            method: 'get',
            url: (payload) => `${Path.engine}/escalation_policies`
        },
        listBySchedule: {
            method: 'get',
            url: (payload) => `${Path.engine}/escalation_policies/schedules/${payload.schedulesId}`
        },
        all: {
            method: 'get',
            url: (payload) => `${Path.engine}/escalation_policies`
        },
        save: {
            method: 'post',
            key: 'escalation_policy',
            url: (payload) => `${Path.engine}/escalation_policies`
        },
        update: {
            method: 'put',
            key: 'escalation_policy',
            url: (payload) => `${Path.engine}/escalation_policies/${payload.id}`,
        },
        delete: {
            method: 'delete',
            url: (payload) => `${Path.engine}/escalation_policies/${payload.id}`,
        },
        //key:'escalationPolicy',
    },
    // state: {},
    // mutations: {},
    // getters: {}
};