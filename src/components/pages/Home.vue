<template>
    <div class="home">
        <div class="layout-menu-left">
            <Row type="flex">
                <Col span="3">
                    <div class="logo"><router-link to="/">Hedwig</router-link></div>
                </Col>
                <Col span="17">
                <Navigation></Navigation>
                </Col>
                <Col span="4" class="right">
                <ChooseTeams></ChooseTeams>
                <Dropdown placement="bottom-end" @on-click="rightMenuClick">
                    <Avatar icon="person" style="top:10px;"/>
                    <DropdownMenu slot="list">
                        <DropdownItem name="myProfile">{{Users.me.data.summary}}</DropdownItem>
                        <Dropdown placement="left-start" @on-click="switchLang">
                            <DropdownItem>
                                <Icon type="earth"></Icon>
                                {{$t('h.language')}}


                            </DropdownItem>
                            <DropdownMenu slot="list">
                                <DropdownItem :disabled="lang === l.value" class="text-align-left" v-for="l in language"
                                              :name="l.value" :key="l.value">{{ l.key }}
                                    <Icon type="checkmark" v-if="lang === l.value"></Icon>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <DropdownItem name="logout">
                            <Icon type="log-out"></Icon>
                            {{$t('h.logout')}}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                </Col>
            </Row>
        </div>
        <div class="layout-right">
            <div class="layout-content">
                <div class="layout-content-main">
                    <Breadcrumb></Breadcrumb>
                    <router-view></router-view>
                </div>
            </div>
        </div>
        <BackTop></BackTop>
    </div>
</template>
<script>
    import _ from 'lodash';
    import Vue from 'vue';
    import {VueUtil, FormUtil} from '@util';
    import Navigation from '../frame/Navigation.vue'
    import Breadcrumb from '../frame/Breadcrumb.vue'
    import RightTopTools from '../frame/RightTopTools.vue'
    import ChooseTeams from './configuration/teams/ChooseTeams.vue'
    import store from 'store';

    export default {
        name: "Home",
        components: {Navigation, Breadcrumb, RightTopTools, ChooseTeams},

        data () {
            return {
                lang: Vue.config.lang || "zh-CN",
                spanLeft: 5,
                spanRight: 19,
                language: [
                    {key: this.$t(`h.chinese`), value: "zh-CN"},
                    {key: this.$t(`h.english`), value: "en-US"},
                ]
            }
        },
        computed: {
            ...VueUtil(this).select(['Users','Schedules']).state(),
            iconSize () {
                return this.spanLeft === 5 ? 14 : 24;
            }
        },
        mounted(){
            const userId = store.get('id');
            VueUtil(this).select('Users')
                .action('me', {id: userId, include: ['teams']});

            VueUtil(this).select('Schedules').action('listByMe',{
                userId: userId,
                include:['escalation_policies'],
            });
//
//            if(this.Users.my_additional_permission.data.)
//            VueUtil(this).select('Users')
//                .action('my_additional_permission',{userId: id});

            if (!store.get('token'))
                this.$router.push('login');
            //自动刷token
            this.refreshToken();
        },
        watch: {
            'Users.refresh_token': 'listenUsers',
            'Users.me': 'listenUsers',
            'Schedules.listByMe': 'listenSchedules',
        },
        methods: {
            ...VueUtil(this).select(['Users','Schedules']).actions(),
            listenUsers(data) {
                VueUtil(this).cb(data).success(() => {
                    if(data.type === 'refresh_token') {
                        let token = _.get(data, 'data.token', null);
                        if (!!token) {
                            store.set('token', token);
                        }
                    }else if(data.type === 'me'){
                        Vue.config.role = data.data.role;
                        store.set('role',Vue.config.role);
                    }
                }).error(()=>{
                    VueUtil(this).logout();
                })
            },
            listenSchedules(data){
                VueUtil(this).cb(data).success(() => {
                    if(data.type === 'listByMe'){
                        let list = _.map(data.data.list, item => {
                            return item.id;
                        });
                        store.set('schedule_list',list);
                    }
                }).error()
            },
            refreshToken(){
                VueUtil(this).select('Users').action('refresh_token');
                setInterval(() => {
                    VueUtil(this).select('Users').action('refresh_token');
                }, 1000 * 1000);
            },
            switchLang(value){
                if (this.lang === value)
                    return;
                store.set("language", value);
                window.location.reload();
            },
            toggleClick () {
                if (this.spanLeft === 5) {
                    this.spanLeft = 2;
                    this.spanRight = 22;
                } else {
                    this.spanLeft = 5;
                    this.spanRight = 19;
                }
            },
            rightMenuClick(name){
                if (name === 'logout') {
                    VueUtil(this).logout();
                } else if (name === 'myProfile') {
                    this.$router.push(`/users/${this.Users.me.data.id}`)
                }
            }
        }

    };
</script>