/**
 * Created by binwang on 17/8/23.
 * 用于将 简化版 vuex 转换成 标准 vuex
 */
import _ from 'lodash';
import store from 'store';
import Vue from 'vue';
import util from '../libs/util';

//scope：功能模块名字
// vuex 配置的actions文件
export default (scope, vuex) => {
    "use strict";
//初始化state，actions，mutations
    let state = {...vuex.state};
    let actions = {};
    let mutations = {};
    _.forEach(_.keys(vuex.actions), key => {
        //固定state的格式
        state[key] = {
            type: key,
            loading: false,
            error: null,
            request: null,
            data: {},
        };
        //定义mutation方法，mutation的职责就是给state赋值
        mutations[`set_${scope}_${key}`] = (state, data) => {
            //如果还没有key的数据
            if (!state[key])
                state[key] = data;
            else
                //扩展符可以得到深复制版的assign的效果，遇到同名的属性，会以后面的为主，扩展符其实也是利用itherator来进行遍历赋值的，自然会有后面的覆盖前面的
                state[key] = {...state[key], ...data};
        };

        //定义action方法
        const action = vuex.actions[key];
        actions[`${scope}_${key}`] = ({commit, state}, payload) => {

            //如果url不存在，直接进行赋值
            if (!action.url) {
                commit(`set_${scope}_${key}`, {data: payload});
            } else {
                //loading
                commit(`set_${scope}_${key}`, {loading: true});
                let url = action.url(payload) || '/';
                //根据请求方法的不同来设置参数的不同
                if (action.method === 'get')
                    url = util.stitchingParams(url, payload, true);
                else
                    url = util.stitchingParams(url, payload, false);

                //限制了重复访问，发送请求,300以内的重复请求不会被执行
                if( Vue.config.last_request && url ===  Vue.config.last_request.url){
                    return;
                }
                Vue.config.last_request = {
                    url : url,
                    payload: payload,
                }
                setTimeout(()=> {
                    Vue.config.last_request = null;
                }, 300);
                //发送请求
                util.headers({
                    Authorization: store.get('token'),
                    Lang: Vue.config.lang,
                    Channel: 'website',
                    From: store.get('email'),
                    overflow: false,
                }).ajax({
                    url: url,
                    method: action.method || 'get',
                    data: util.payloadWrapper(action, url, payload),
                }).then(function (res) {
                        if (action.format) {
                            commit(`set_${scope}_${key}`, {
                                loading: false,
                                error: null,
                                request: payload,
                                ...action.format(res)
                            });
                        } else {
                            if (util.isMock(url)) { // 处理mock数据
                                commit(`set_${scope}_${key}`, util.mockHandler(res));
                            } else {
                                commit(`set_${scope}_${key}`, {
                                    ...util.apiHandler(res),
                                    request: payload,
                                });
                            }
                        }
                    }
                ).catch(function (error) {
                    if (_.get(error, 'response.status', 500) >= 500) {
                        // alert('服务异常!');
                    }
                    commit(`set_${scope}_${key}`, {
                        loading: false,
                        error: _.get(error.response, 'data.error', null) || error,
                        data: {}
                    });
                })
            }
        }
    });
    return {
        state,
        actions,
        getters: vuex.getters || {},
        mutations: {...mutations, ...vuex.mutations},
    }
}