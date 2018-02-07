/**
 * Created by binwang on 17/8/26.
 */
import {Path} from '@util';

export default {
    actions: {
        get: {
            method: 'get',
            url: (payload) => `${Path.engine}/incidents/${payload.id}`
        },
        getByIncidentsNumber: {
            method: 'get',
            url: (payload) => `${Path.engine}/incidents`
        },
        gotoByIncidentsNumber: {
            method: 'get',
            url: (payload) => `${Path.engine}/incidents`
        },
        statistics: {
            method: 'get',
            url: (payload) => `${Path.engine}/ext/incidents/statistics`,
            format: (response) => {
               return {
                   data: {
                       ...response.data
                   }
               }
            }
        },
        list: {
            method: 'get',
            url: (payload) => `${Path.engine}/incidents`
        },
        all: {
            method: 'get',
            url: (payload) => `${Path.engine}/incidents`
        },
        responder_to_me: {
            method: 'get',
            url: (payload) => `${Path.engine}/incidents`
        },
        assignToMe: {
            method: 'get',
            url: (payload) => `${Path.engine}/incidents`
        },
        assignToMyTeam: {
            method: 'get',
            url: (payload) => `${Path.engine}/incidents`
        },
        save: {
            method: 'post',
            url: (payload) => `${Path.engine}/incidents`
        },
        update: {
            method: 'put',
            url: (payload) => `${Path.engine}/incidents/${payload.id}`,
        },
        responderReply: {
            method: 'put',
            url: (payload) => `${Path.engine}/incidents/${payload.id}`,
        },
        redact: {
            method: 'put',
            url: (payload) => `${Path.engine}/incidents/${payload.id}/redact`,
        },
        delete: {
            method: 'delete',
            url: (payload) => `${Path.engine}/incidents/${payload.id}`,
        },
        manage:{
            method:'put',
            key:'incidents',
            url: (payload) => `${Path.engine}/incidents`
        },
        reassign:{
            method:'put',
            key:'incidents',
            url: (payload) => `${Path.engine}/incidents`
        },
        responder:{
            method:'put',
            key:'incident',
            url: (payload) => `${Path.engine}/incidents/${payload.id}`
        },
        merge: {
            method: 'put',
            key:'',
            url: (payload) => `${Path.engine}/incidents/${payload.id}/merge`,
        },
        note_list: {
            method : 'get',
            url : (payload) => `${Path.engine}/incidents/${payload.incidentId}/notes`,
        },
        note_get: {
            method : 'get',
            url : (payload) => `${Path.engine}/incidents/${payload.incidentId}/notes/${payload.noteId}`,
        },
        note_save: {
            method: 'post',
            key: 'note',
            url: (payload) => `${Path.engine}/incidents/${payload.incidentId}/notes`
        },
        note_delete: {
            method: 'delete',
            url: (payload) => `${Path.engine}/incidents/${payload.incidentId}/notes/${payload.noteId}`,
        },

        subscribers_list: {
            method: 'get',
            url :(payload) => `${Path.engine}/ext/incidents/${payload.incidentId}/subscribers`
        },

        subscribers_get: {
            method: 'get',
            url :(payload) => `${Path.engine}/ext/incidents/${payload.incidentId}/subscribers/${payload.id}`
        },
        subscribers_save: {
            method: 'post',
            key:'subscriber',
            url :(payload) => `${Path.engine}/ext/incidents/${payload.incidentId}/subscribers`
        },
        subscribers_delete: {
            method: 'delete',
            url :(payload) => `${Path.engine}/ext/incidents/${payload.incidentId}/subscribers/${payload.id}`
        },
        publishedinfos_list: {
            method: 'get',
            url :(payload) => `${Path.engine}/ext/incidents/${payload.incidentId}/publishedinfos`
        },
        publishedinfos_save: {
            method: 'post',
            key: 'publishedInfo',
            url :(payload) => `${Path.engine}/ext/incidents/${payload.incidentId}/publishedinfos`
        },
        publishedinfos_get: {
            method: 'get',
            url :(payload) => `${Path.engine}/ext/incidents/${payload.incidentId}/publishedinfos/${payload.id}`
        },
        publishedinfos_delete: {
            method: 'delete',
            url :(payload) => `${Path.engine}/ext/incidents/${payload.incidentId}/publishedinfos/${payload.id}`
        },


    },
    // state: {},
    // mutations: {},
    getters: {

    }
}