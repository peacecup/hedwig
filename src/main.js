import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';
import _ from 'lodash';
import moment from 'moment';
import Routers from './router';
import Vuex from 'vuex';
import Util from './libs/util';
import App from './app.vue';
//拖拽用组件
import VueDND from 'awe-dnd';
import Store from 'store';
import 'iview/dist/styles/iview.css';
import '!style-loader!css-loader!less-loader!./themes/index.less';

import VueI18n from 'vue-i18n';
import Locales from './locales'; 
import zhLocale from 'iview/src/locale/lang/zh-CN';
import enLocale from 'iview/src/locale/lang/en-US';
import modules from './actions';
import commonComponents from './components/common';
// timezone from 'moment-timezone';
import '@util/directive.js';

const defaultTimezone = "Asia/Shanghai";
//timezone.tz.setDefault(defaultTimezone);
Vue.config.timezone = defaultTimezone;

Vue.config.sys_error_show = true;

Vue.prototype._ = _;

Vue.prototype.moment = moment;

if(process.env.NODE_ENV === 'production') {
    Vue.config.permissionSwitch = false;
}else
    Vue.config.permissionSwitch = true;


Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueI18n);
Vue.use(iView);
Vue.use(VueDND);
_.keys(commonComponents).map(k => {
    Vue.use(commonComponents[k]);
});

// 自动设置语言，获取浏览器语言  9 
const navLang = navigator.language;
// const localLang = 'en-US';
const localLang = (navLang === 'zh-CN' || navLang === 'en-US') ? navLang : false;
const lang = Store.get('language') || localLang || 'zh-CN';

Vue.config.lang = lang;

// 多语言配置
const locales = Locales;
const mergeZH = Object.assign(zhLocale, locales['zh-CN']);
const mergeEN = Object.assign(enLocale, locales['en-US']);
Vue.locale('zh-CN', mergeZH);
Vue.locale('en-US', mergeEN);


// 路由配置
const RouterConfig = {
    mode: 'history',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

const myPluginWithSnapshot = store => {
    let prevState = _.cloneDeep(store.state)
    store.subscribe((mutation, state) => {
        let nextState = _.cloneDeep(state)

        // console.log("%c prevState", "color:green")
        // console.log(prevState);
        // console.log("%c nextState", "color:red")
        // console.log(nextState);
        // 比较 prevState 和 nextState...

        // 保存状态，用于下一次 mutation
        prevState = nextState
    })
}

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    next();
});

router.afterEach(() => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});


const store = new Vuex.Store({
    modules: modules,
    plugins: process.env.NODE_ENV !== 'production'
        ? [myPluginWithSnapshot]
        : []
});


new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App)
});