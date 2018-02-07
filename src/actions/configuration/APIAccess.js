/**
 * Created by binwang on 17/9/12.
 */
import {Path} from '@util';

export default {
    actions: {
        get: {
            method: 'get',
            url: (payload) => `${Path.uc}/api_tokens/${payload.id}`
        },
        list: {
            method: 'get',
            url: (payload) => `${Path.uc}/api_tokens`
        },
        save: {
            method: 'post',
            key:'apiToken',
            url: (payload) => `${Path.uc}/api_tokens`
        },
        update: {
            method: 'put',
            key:'apiToken',
            url: (payload) => `${Path.uc}/api_tokens/${payload.id}`,
        },
        delete: {
            method: 'delete',
            url: (payload) => `${Path.uc}/api_tokens/${payload.id}`,
        },
    },
    // state: {},
    // mutations: {},
    // getters: {}
}