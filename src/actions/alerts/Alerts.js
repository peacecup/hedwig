/**
 * Created by binwang on 17/8/27.
 */
import {Path} from '@util';

export default {
    actions: {
        get: {
            method: 'get',
            url: (payload) => `${Path.alert}/alerts/${payload.alertId}`
        },
        list: {
            method: 'get',
            url: (payload) => `${Path.alert}/alerts`
        },
        update: {
            method: 'put',
            key:'alerts',
            url: (payload) => `${Path.alert}/alerts`
        },
        get_incident_alert_list: {
            method: 'get',
            url: (payload) => `${Path.alert}/incidents/${payload.id}/alerts`
        }
    }
}
