/**
 * Created by binwang on 17/8/25.
 */
import {Path} from '@util';

export default {
    actions: {
        get: {
            method: 'get',
            url: (payload) => `${Path.engine}/services/${payload.id}`
        },
        list: {
            method: 'get',
            url: (payload) => `${Path.engine}/services`
        },
        all: {
            method: 'get',
            url: (payload) => `${Path.engine}/services`
        },
        save: {
            method: 'post',
            url: (payload) => `${Path.engine}/services`
        },
        saveIntegration: {
            method: 'post',
            key:'integration',
            url: (payload) => `${Path.engine}/services/${payload.service.id}/integrations`
        },
        update: {
            method: 'put',
            url: (payload) => `${Path.engine}/services/${payload.id}`,
        },
        delete: {
            method: 'delete',
            url: (payload) => `${Path.engine}/services/${payload.id}`,
        },
        event_rules_get: {
            method: 'get',
            url: (payload) => `${Path.engine}/services/${payload.serviceId}/event_rules/${payload.id}`
        },
        event_rules_save: {
            method: 'post',
            key:'eventRule',
            url: (payload) => `${Path.engine}/services/${payload.serviceId}/event_rules`
        },
        event_rules_update: {
            method: 'put',
            key:'eventRule',
            url: (payload) => `${Path.engine}/services/${payload.serviceId}/event_rules/${payload.id}`
        },
        event_rules_change_order: {
            method: 'put',
            key:'',
            url: (payload) => `${Path.engine}/services/${payload.serviceId}/event_rules`
        },
        event_rules_delete: {
            method: 'delete',
            url: (payload) => `${Path.engine}/services/${payload.serviceId}/event_rules/${payload.id}`,
        },
        event_rules_list: {
            method: 'get',
            key:'eventRules',
            url: (payload) => `${Path.engine}/services/${payload.serviceId}/event_rules`
        },
        on_call :{
            method: 'get',
            url: (payload) => `${Path.engine}/services/${payload.serviceId}/on_call`
        }
    },
    // state: {},
    // mutations: {},
    // getters: {}
}