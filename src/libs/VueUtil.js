/**
 * Created by binwang on 17/8/24.
 */
import _ from 'lodash';
import {mapActions, mapState, mapGetters} from 'vuex';
//所有actions的集合对象
import * as Actions from '../actions';
import Vue from 'vue';
import store from 'store';

//单例模式，将组件的this对象传入进来
//_context：组件上下文 this
function util(_context, defaultEntity) {
    "use strict";
    if (!arguments)
        throw new Error('缺少Vue上下文 this ');
    let $this = _context;
    let entity = defaultEntity;

    //传入一个actions模块的名称
    this.select = (_entity) => {
        entity = _entity;
        return this;
    };
    //调用action的方法
    this.action = (action, payload, handler) => {

        //对请求参数做二次处理
        if (handler && _.isFunction(handler)) {
            payload = handler.call(this, payload);
        }
        //this[Users_get]，已经在action是方法中进行了注入，就可以使用，否则会报错
        if (_.isFunction($this[`${entity}_${action}`]))
            $this[`${entity}_${action}`].call(this, payload);
        else {
            console.log(`%c not find action ${entity}_${action}]! please verify action name!`, "color:red")
        }
        return this;
    }
    //data包含的模块名称的vuexstate置为干净
    this.clear = (data) => {
        if(_.isString(data)) {
            $this.$store.commit(`set_${entity}_${data}`, {data: {}, request: {}});
        }else if(_.isArray(data)) {
            _.map(data, this.clear);
        }
        return this;
    }
    //常用的restAPI方法get、post、delete、put
    this.save = (payload, handler) => {
        if (handler && _.isFunction(handler)) {
            const proxyPayload = handler.call(this, _.cloneDeep(payload));
            this.action('save', proxyPayload);
        } else {
            this.action('save', payload);
        }
        return this;
    }
    this.update = (payload, handler) => {
        if (handler && _.isFunction(handler)) {
            payload = handler.call(this, payload);
        }
        this.action('update', payload);
        return this;
    };
    this.delete = (payload) => {
        this.action('delete', _.isObject(payload) ? payload : {id: payload});
        return this;
    };
    this.list = (payload) => {
        this.action('list', payload);
        return this;
    };
    this.all = (payload) => {
        this.action('all', payload);
        return this;
    };
    this.get = (payload) => {
        this.action('get', _.isObject(payload) ? payload : {id: payload});
        return this;
    };

    // 操作 Action end

    // 引入 环境变量[Action State] start
    this.actions = () => {
        let actions = []
        const entitys = coverEntity(entity);
        _.forEach(entitys, e => {
            //e就是注入的组件模块名称之一
            _.mapKeys(Actions.default[e].actions, (value, key) => {
                actions.push(key);
            });
        })
        return mapActions(actions);
    };
    //将state注入到组件为computed属性
    this.state = () => {
        //action模块名称
        const entitys = coverEntity(entity);
        let state = {};
        _.forEach(entitys, key => {
            _.assign(state, {
                [key]: state => {
                    return _.get(state, key, null);
                }
            })
        })
        return mapState(state)
    }

    //将getters注入到组件中
    this.getters = () => {
        let getters = []
        const entitys = coverEntity(entity);
        _.forEach(entitys, e => {
            _.mapKeys(Actions.default[e].getters, (value, key) => {
                getters.push(key);
            });
        })
        return mapGetters(getters);
    }
    // 引入 环境变量[Action State] end

    function coverEntity(_entity) {
        if (_.isString(entity)) {
            return [entity];
        } else if (_.isArray(entity)) {
            return entity;
        } else {
            throw new Error("select 传递了错误的参数 ,必须是 字符串或者字符串数组!")
        }
    }

    this.guid = () => {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    let cbData = null;
    //将返回结果注入这个工具中来
    this.cb = (data) => {
        this.cbData = data;
        return this;
    }
    this.success = (success) => {
        if (!this.cbData.loading && !this.cbData.error) {
            if (success && _.isFunction(success)) {
                success.call();
            } else {
                $this.$Message.success(`${this.cbData.type} success!`);
                $this.loading = this.cbData.loading;
            }
        }
        return this;
    }
    this.logout = () => {
        store.remove('login', null);
        store.remove('id', null);
        store.remove('token', null);
        store.remove('email', null);
        store.remove('team', null);
        store.remove('functions', null);
        store.remove('permissions', null);
        setTimeout(() => {
            $this.$router.push("/login");
        }, 600);
    }
    this.error = (error) => {
        const delay = 3200;
        if (!this.cbData.loading && this.cbData.error) {
            //定义ret让，自定义的error可以执行
            let ret = true;
            if (error && _.isFunction(error)) {
                ret = error.call();
            }
            if(ret){
                //锁定错误提示
                setTimeout(() => {
                    $this.loading = false;
                }, delay);
                if (!Vue.config.sys_error_show) {
                    return;
                }
                Vue.config.sys_error_show = false;
                //lodash的get方法第三个参数指定在没有获取到值时的默认值
                let error_code = _.get(this.cbData, 'error.code', 'HEDWID_COMMON_SYSTEM_ERROR');
                let error_code_split = error_code.split('_');
                let error_msg = '';
                //处理 hedwig 后台错误代码
                if (error_code_split.length > 2) {
                    let key = "";
                    _.forEach(error_code_split, (code, index) => {
                        if (index === 1) {
                            key += code + '.';
                        } else if (index === error_code_split.length - 1) {
                            key += code;
                        } else
                            key += code + '_';
                    });
                    error_msg = $this.$t(`error.${key}` || 'unknow error!');
                } else {
                    error_msg = $this.$t(`error.${error_code}` || 'unknow error!');
                }

                if (error_code === 'HEDWID_COMMON_SYSTEM_ERROR') { //系统异常右侧提示
                    $this.$Notice.error({
                        title: 'Error',
                        desc: $this.$t(error_msg),
                        duration: delay / 1000
                    });
                } else if (error_code === 'HEDWID_AUTH_TOKEN_AUTHORIZATION_FAILED' || error_code === 'HEDWID_AUTH_TOKEN_EXPIRED') { //token 失效跳转
                    $this.$Notice.error({
                        title: 'Error',
                        desc: $this.$t(error_msg),
                        duration: delay / 1000
                    });
                    this.logout();

                } else {  //其他异常中间提示
                    $this.$Message.error({
                        content: error_msg,
                        duration: delay / 1000
                    });
                }
                setTimeout(() => {
                    Vue.config.sys_error_show = true;
                }, delay);
            }
        }
        return this;
    }

    this.I18n = (key) => {
        if (!key) return '';
        return _.reduce(key.split(' '), (n1, n2) => {
            if (/^[A-Za-z\s]+$/.test(n1))
                n1 = n1 + ' ';
            return n1 + $this.$t(`h.${_.lowerCase(n2)}`);
        }, '');
    }
}
export default (context, defaultEntity) => new util(context, defaultEntity);