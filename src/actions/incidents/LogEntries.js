
/**
 * Created by binwang on 17/11/1.
 */

import {Path} from '@util';

export default {
    actions: {
        list: {
            method: 'get',
            url : (payload) => `${Path.engine}/log_entries`,
        },
        incident_list: {
            method: 'get',
            url : (payload) => `${Path.engine}/incidents/${payload.id}/log_entries`,
        },
    }
}