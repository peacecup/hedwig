/**
 * Created by binwang on 17/8/31.
 */
import {Path} from '@util';

export default {
    actions: {
        get: {
            method: 'get',
            url: (payload) => `${Path.schedule}/schedules/${payload.id}`
        },
        list: {
            method: 'get',
            url: (payload) => `${Path.schedule}/schedules`
        },
        listByUser: {
            method: 'get',
            url: (payload) => `${Path.schedule}/schedules`
        },
        listByMe: {
            method: 'get',
            url: (payload) => `${Path.schedule}/schedules`
        },
        all: {
            method: 'get',
            url: (payload) => `${Path.schedule}/schedules`
        },
        preview: {
            method: 'post',
            url: (payload) => `${Path.schedule}/schedules/preview`
        },
        save: {
            method: 'post',
            key:'schedule',
            url: (payload) => `${Path.schedule}/schedules`
        },
        update: {
            method: 'put',
            key:'schedule',
            url: (payload) => `${Path.schedule}/schedules/${payload.id}`,
        },
        delete: {
            method: 'delete',
            url: (payload) => `${Path.schedule}/schedules/${payload.id}`,
        },
        override_list: {
            method: 'get',
            url: (payload) => `${Path.schedule}/schedules/${payload.id}/overrides`
        },
        override_save:{
            method : 'post',
            key:'override',
            url: (payload) => `${Path.schedule}/schedules/${payload.scheduleId}/overrides`,
        },
        override_delete:{
            method : 'delete',
            url: (payload) => `${Path.schedule}/schedules/${payload.scheduleId}/overrides/${payload.id}`,
        },
        snapshots_list:{
            method : 'get',
            url: (payload) => `${Path.schedule}/schedules/${payload.scheduleId}/snapshots`,
        },
        snapshots_get:{
            method : 'get',
            url: (payload) => `${Path.schedule}/schedules/${payload.scheduleId}/snapshots/${payload.snapshotId}`,
        },

    },
    // state: {},
    // mutations: {},
    // getters: {}
}