/**
 * Created by binwang on 17/8/25.
 */
import {Path} from '@util';

export default {
    actions: {
        get: {
            method: 'get',
            key:'integration',
            url: (payload) => `${Path.engine}/services/${payload.id}/integrations/${payload.integrationId}`
        },
        list: {
            method: 'get',
            key:'integration',
            url: (payload) => `${Path.engine}/services/${payload.id}/integrations`
        },
        save: {
            method: 'post',
            key:'integration',
            url: (payload) => `${Path.engine}/services/${payload.serviceId}/integrations`
        },
        update: {
            method: 'put',
            key:'integration',
            url: (payload) => `${Path.engine}/services/${payload.serviceId}/integrations/${payload.integrationId}`
        },
        delete: {
            method: 'delete',
            key:'integration',
            url: (payload) => `${Path.engine}/services/${payload.id}/integrations/${payload.integrationId}`
        },
        changeKey: {
            method: 'put',
            key:'integration',
            url: (payload) => `${Path.engine}/services/${payload.id}/integrations/${payload.integrationId}/change_key`
        }
    },
    state: {},
    mutations: {},
    getters: {}
}