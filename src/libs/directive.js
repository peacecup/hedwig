/**
 * Created by binwang on 17/11/2.
 */
import Vue from 'vue';
import _ from 'lodash';
import store from 'store';

function hasPermission(functions, value) {
    if (!value || value === '')
        return true;
    let has = false;
    if (_.isString(value)) {
        has = _.includes(functions, value);
    } else if (_.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            has = _.includes(functions, value[i]);
            if (has) {
                return has;
            }
        }
    } else if (_.isObject(value)) {
        if (value.ignore) return true;
        return hasPermission(functions, value.key);
    }
    return has;
}
//自定义权限指令
Vue.directive('key', {
    deep:true,
    bind:  (el, binding, vnode) => {
        if(!Vue.config.permissionSwitch) return;

        if (!hasPermission(vnode.context.$store.getters.permissions.functions, binding.value)) {
            if(_.get(binding,'value.type',null) === 'disabled') {
                _.set(vnode,'componentOptions.propsData.disabled',true);
            }else {
                el.style.display = 'none';
            }
        }
    },
    update: (el, binding, vnode) => {
        if(!Vue.config.permissionSwitch) return;

        if (hasPermission(vnode.context.$store.getters.permissions.functions, binding.value)) {
            if(_.get(binding,'value.type',null) === 'disabled') {
                _.set(vnode,'componentOptions.propsData.disabled',false);
            }else {
                el.style.display = '';
            }
        }
    }
});
Vue.directive('pageKey', {
    bind: function (el, binding, vnode) {

    },
    update: function (el, binding, vnode) {
        if(!Vue.config.permissionSwitch) return;

        if (!hasPermission(vnode.context.$store.getters.permissions.functions, binding.value)) {
            el.innerHTML = '<div style="color: red;width: 400px;position: absolute;left: 50%;margin-left:-200px;top: 200px;"><h1>Do not have permission!</h1></div>';
        }
    }
});
