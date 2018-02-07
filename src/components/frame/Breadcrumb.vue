<template>
    <div style="padding-left:10px;">

        <Breadcrumb>
            <Icon type="home"></Icon>
            <Breadcrumb-item v-for="(item,index) in breadlist" :key="item.path">
                <span v-if="item.path">
                    <router-link :to="item.path">{{item.name}}</router-link>
                </span>
                <span v-else>{{item.name}}</span>
            </Breadcrumb-item>
        </Breadcrumb>
    </div>
</template>
<script>
    import _ from 'lodash';
    import {VueUtil} from '@util';
    export default{
        created() {
            this.getBreadcrumb(true);//刷新的参数为true
        },
        data() {
            return {
                breadlist: '' // 路由集合
            }
        },
        mounted(){
        },
        methods: {
            getBreadcrumb(isreload) {
                let matched = this.$route.matched;
                matched = _.chain(matched).filter(m => m.name).map(m => {
                    if (m.name === 'Configuration') {
                        return {name: this.I18n(m.name)};
                    } else {
                        _.keys(this.$route.params).forEach( key => {
                            m.path = m.path.replace(`:${key}`,this.$route.params[key]);
                        })
                        return {path: m.path, name: this.I18n(m.name)};
                    }
                }).value();
                this.$store.commit('breadListStateSet', matched);
                matched[0].path = "/";
                this.breadlist = matched;
            },
            I18n(name){
                return VueUtil(this).I18n(name);
            }
        },
        watch: {
            $route () {
                this.getBreadcrumb();
            }
        },
    }
</script>
