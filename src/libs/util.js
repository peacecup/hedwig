import axios from 'axios';
/*import env from '../config/env';*/
import _ from 'lodash';
import  Vue from 'vue';

let util = {};
util.title = function (title) {
    title = title ? title + ' - Home' : 'Hedwig';
    window.document.title = title;
};
//
// const ajaxUrl = env === 'development' ?
//     '/' :
//     env === 'production' ?
//     'https://www.url.com' :
//     'https://debug.url.com';
const ajaxUrl = '/';

util.config = {
    baseURL: ajaxUrl,
    timeout: 20000,
    responseType: 'json',
}
if (process.env.NODE_ENV === `development`) {
    util.config.timeout = 5000;
}


util.creqte = axios.create;
util.headers = (headers) => {
    return {
        ajax: axios.create({
            ...util.config,
            headers: headers,
        })
    };
};
util.ajax = axios.create(util.config);

util.stitchingParams = (url, payload, all) => {
    if (!all){
        if(payload.params){
            return util.stitchingParams(url,payload.params,true);
        }else{
            return url;
        }
    }
    let params = _.keys(payload).map(k => {
        if (_.isNull(payload[k]) || _.isUndefined(payload[k]) || _.isEqual(payload[k], '')) {
            return null;
        } else {
            if (util.isMock(url)) {
                return k + "=" + payload[k];
            } else {
                if (_.isArray(payload[k])) {
                    return _.reduce(payload[k], (k1, k2) => {
                        return `${k1}&${k}=${k2}`;
                    }, "")
                } else if (k === 'offset') {
                    return k + "=" + (payload[k] - 1);
                } else if (k === 'sortField') {
                    if (payload['sortOrder'] === 'normal')
                        return null;
                    else
                        return `sort_by=${payload['sortField']}:${payload['sortOrder']}`;
                } else if (k === 'sortOrder') {
                    return null;
                } else
                    return k + "=" + payload[k];
            }
        }
    }).filter(m => m !== null).join("&");
    let s = url + ((params === "") ? "" : ("?" + params));
    if (process.env.NODE_ENV === `development`)
        console.log(s);
    return s;
};

util.mockHandler = (res) => {
    return {
        source: 'mock',
        loading: false,
        error: res.errorMsg,
        data: res.data.content || 'data format error!'
    };
}


util.apiHandler = (res) => {
    res = res.data;
    let error = null;
    let data = {};
    let keys = _.keys(res);
    _.forEach(keys, key => {
        if (key === 'offset') {
            data[key] = res[key] + 1;
        } else if (key === 'limit' || key === 'more' || key === 'total') {
            data[key] = res[key];
        } else if (key === 'error') {
            error = res[key];
        } else {
            data.list = res[key];
        }
    });
    if(!_.includes(keys,'offset') || !_.includes(keys,'limit')){
        data  = data.list;
    }
    return {
        source: 'api',
        loading: false,
        error: error,
        data: data
    }
}

util.isMock = (url) => {
    return /^\/mock/.test(url);
}

util.payloadWrapper = (action, url, payload) => {
    if (!util.isMock(url)) {
        if (!_.isUndefined(action.key)) {
            if(action.key === ''){
                return payload;
            }else{
                return {
                    [action.key]: payload
                }
            }
        } else {
            let name = url.split("/")[3];
            name = name.substring(0, name.length - 1);
            return {
                [name]: payload
            }
        }
    } else {
        return payload;
    }
}


export default util;