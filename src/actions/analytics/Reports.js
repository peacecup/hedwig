/**
 * Created by evan on 17/11/13.
 */
import {Path} from '@util';

export default {
    actions: {
        get_alerts_report: {
            method: 'get',
            url: (payload) => `${Path.report}/alerts_per_time`
        },
        get_incidents_report: {
            method: 'get',
            url: (payload) => `${Path.report}/incidents_per_time`
        }
    }
}