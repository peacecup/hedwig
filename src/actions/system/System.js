/**
 * Created by binwang on 17/8/26.
 */
import {Path} from '@util';

export default {
    actions: {
        times: {
            method: 'get',
            url: (payload) => `${Path.engine}/times/current`
        },
    },
    // state: {},
    // mutations: {},
    // getters: {}
}