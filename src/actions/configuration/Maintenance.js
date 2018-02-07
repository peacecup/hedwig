/**
 * Created by binwang on 17/9/13.
 */
import {Path} from '@util';


export default {
    actions: {
        get: {
            method: 'get',
            url: (payload) => `${Path.engine}/maintenance_windows/${payload.id}`
        },
        list: {
            method: 'get',
            url: (payload) => `${Path.engine}/maintenance_windows`
        },
        all: {
            method: 'get',
            url: (payload) => `${Path.engine}/maintenance_windows`
        },
        save: {
            method: 'post',
            key: 'maintenance_window',
            url: (payload) => `${Path.engine}/maintenance_windows`
        },
        update: {
            method: 'put',
            key: 'maintenance_window',
            url: (payload) => `${Path.engine}/maintenance_windows/${payload.id}`,
        },
        delete: {
            method: 'delete',
            url: (payload) => `${Path.engine}/maintenance_windows/${payload.id}`,
        },
    },
    // state: {},
    // mutations: {},
    // getters: {}
}