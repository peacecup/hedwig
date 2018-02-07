<template>
    <div class="subscribers">
        <div class="mask-layer" v-if="showSelect"
             @click="closeMasklayer"></div>
        <Row>
            <Col span="10">
            <h2>SUBSCRIBERS</h2>
            <div class="divider top-bottom-10"></div>
            <div class="select-target">
                <Input style="max-width:400px;" v-key="'incident.manager_subscriber'" placeholder="Add a subscriber" @on-focus="onFocus"/>
                <transition name="slide-up">
                <Card v-if="showSelect" style="z-index:5;position: absolute;width: 400px;">
                    <Tabs :animated="false">
                        <Tab-pane label="Users">
                            <template v-if="users && users.length > 0">
                                <ul class="items">
                                    <li v-for="user in users" @click="seletUser(user)">{{user.name}}</li>
                                </ul>
                            </template>
                            <template v-else>
                                <div class="text-align-center top-bottom-10">No match!</div>
                            </template>

                        </Tab-pane>
                        <Tab-pane label="Teams">
                            <template v-if="teams && teams.length > 0">
                                <ul class="items">
                                    <li v-for="team in teams" @click="selectTeam(team)">{{team.name}}</li>
                                </ul>
                            </template>
                            <template v-else>
                                <div class="text-align-center top-bottom-10">No match!</div>
                            </template>
                        </Tab-pane>
                    </Tabs>
                </Card>
                </transition>
            </div>
            <div class="top-bottom-10">
                <strong>Individuals ({{subscribers_list.length}})</strong>
                <div class="show-list">
                    <div v-for="subscrib in subscribers_list">
                        <Poptip :transfer="true" trigger="click" :title=" subscrib.summary || subscrib.target_id"
                                placement="right" :width="350">
                            <div class="poptip-body">
                                <p><a href="javascript:void(0)">{{ subscrib.summary || subscrib.target_id }}</a></p>
                                <p>Added at {{ moment(subscrib.created_at).format('HH:mm A')}}</p>
                            </div>
                            <div class="api" slot="content">
                                <strong>Current Time</strong>
                                <p>{{moment().format('HH:mm')}}</p>
                                <strong>Email</strong>
                                <p>{{getEmail(subscrib)}}</p>
                                <div class="divider"></div>
                                <Row type="flex">
                                    <Col span="12">
                                    <Button v-key="{key:'incident.manager_subscriber', ignore: permission}"
                                            @click="profile(subscrib)"
                                            style="margin-top:5px;text-align: left;"
                                            icon="eye" size="small">View Profile


                                    </Button>
                                    </Col>
                                    <Col span="12" class="text-align-right">
                                    <Button @click="removeSubscriber(subscrib)" style="margin-top:5px;text-align: left;"
                                            icon="close" size="small">Remove subscriber


                                    </Button>
                                    </Col>
                                </Row>
                            </div>
                        </Poptip>
                    </div>
                </div>
            </div>
            </Col>
            <Col span="14">
            <h2>STATUS UPDATE</h2>
            <div class="divider top-bottom-10"></div>
            <div>
                <Row>
                    <Col span="24">
                    <Input v-key="'incident.add_note'" v-model="content" :rows="3" :maxlength="100" type="textarea"/>
                    </Col>
                    <Col span="24" v-key="'incident.add_note'" >
                        <Button :disabled="content.length === 0" type="success" @click="savePublishedInfo">
                            Notify Subscribers

                        </Button>
                        <div class="divider top-bottom-5"></div>
                    </Col>
                    <Col span="24">
                    <div class="show-list">
                        <div v-for="p in publishedinfos_list">
                            <Poptip :transfer="true" trigger="click" :title=" p.publisher.summary || p.publisher.id"
                                    placement="right" :width="350">
                                <div class="poptip-body">
                                    <p><a href="javascript:void(0)">{{ p.publisher.summary || p.publisher.id }}</a></p>
                                    <p>{{p.content}}</p>
                                    <p>Added at {{ moment(p.created_at).format('HH:mm A')}}</p>
                                </div>
                                <div class="api" slot="content">
                                    <Row type="flex">
                                        <Col span="24">
                                        <strong>Current Time</strong>
                                        <p>
                                            {{moment().format('HH:mm A')}}
                                            </p>
                                        </Col>
                                        <Col span="12">
                                        <Button
                                                v-key="'incident.manager_subscriber'"
                                                @click="userProfile(p.publisher.id)"
                                                style="margin-top:5px;text-align: left;"
                                                icon="eye" size="small">View Profile

                                        </Button>
                                        </Col>
                                        <Col span="12">
                                        </Col>
                                    </Row>
                                </div>
                            </Poptip>
                        </div>
                    </div>
                    </Col>
                </Row>
            </div>
            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import store from 'store';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'IncidentsSubScribers',
        components: {},
        computed: {
            ...VueUtil(this).select(['Incidents', 'Users', 'Teams']).state(),
        },
        props: {
            incident: {
                type: Object,
                default: null
            },
            permission: {
                type: Boolean,
                default: false
            }
        },
        //publishedInfo
        //subscribers
        data(){
            return {
                showSelect: false,
                published: null,
                subscribers_list: [],
                publishedinfos_list: [],
                users: [],
                teams: [],
                content: '',
            }
        },
        mounted(){


        },
        watch: {
            'incident': 'listenIncident',
            'Users.all': 'listenUsers',
            'Teams.all': 'listenTeams',
            'Incidents.subscribers_list': 'listenIncidentSubscribers',
            'Incidents.subscribers_save': 'listenIncidentSubscribers',
            'Incidents.subscribers_delete': 'listenIncidentSubscribers',
            'Incidents.publishedinfos_list': 'listenPublishedInfo',
            'Incidents.publishedinfos_save': 'listenPublishedInfo',
            'Incidents.publishedinfos_delete': 'listenPublishedInfo',
        },
        methods: {
            ...VueUtil(this).select(['Incidents', 'Users', 'Teams']).actions(),
            onFocus(){
                this.showSelect = true;
                VueUtil(this).select('Users').all().select('Teams').all();
            },
            listenPublishedInfo(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'publishedinfos_list') {
                        this.publishedinfos_list = data.data.list;
                    } else if (data.type === 'publishedinfos_save') {
                        this.content = '';
                        this.queryPublishedInfo();
                    } else if (data.type === 'publishedinfos_delete') {
                        this.queryPublishedInfo();
                    }
                }).error();
            },
            queryPublishedInfo(incident){
                if (!incident) incident = this.incident;
                VueUtil(this).select('Incidents').action('publishedinfos_list', {
                    incidentId: incident.id,
                })
            },

            savePublishedInfo(){
                VueUtil(this).select('Incidents').action('publishedinfos_save', {
                    incidentId: this.incident.id,
                    content: this.content,
                    publisher: {
                        id: store.get("id"),
                    },
                    incident: {
                        id: this.incident.id,
                    },
                })
            },

            removePublishedInfo({id}){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select('Incidents').action('publishedinfos_delete', {
                            incidentId: this.incident.id,
                            id: id,
                        })
                    }
                });
            },

            listenIncidentSubscribers(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'subscribers_list') {
                        this.subscribers_list = data.data.list;
                    } else if (data.type === 'subscribers_save') {
                        this.showSelect = false;
                        this.querySubscribe();
                    } else if (data.type === 'subscribers_delete') {
                        this.querySubscribe();
                    }
                }).error();
            },
            listenIncident(incident){
                this.querySubscribe(incident);
                this.queryPublishedInfo(incident);
            },

            querySubscribe(incident){
                if (!incident) incident = this.incident;
                VueUtil(this).select('Incidents').action('subscribers_list', {
                    incidentId: incident.id,
                })
            },
            saveSubscribe(target_id = null, type = 'user'){
                if (target_id === null) return;
                let exist = _.chain(this.subscribers_list).filter(s => s.type === type).map(s => s.target_id).includes(target_id).value();

                if (exist) {
                    this.$Message.warning(`This ${type} is subscribed!`);
                    return;
                }

                VueUtil(this).select('Incidents').action('subscribers_save', {
                    incidentId: this.incident.id,
                    incident: {
                        id: this.incident.id,
                    },
                    target_id, type: type,
                })
            },
            removeSubscriber({id}){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select('Incidents').action('subscribers_delete', {
                            incidentId: this.incident.id,
                            id: id,
                        })
                    }
                });
            },
            closeMasklayer(){
                this.showSelect = false;
            },
            seletUser(user){
                this.saveSubscribe(user.id, 'user');

            },
            selectTeam(team){
                this.saveSubscribe(team.id, 'team');
            },
            listenUsers(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'all') {
                        this.users = data.data.list;
                    }
                }).error();
            },
            listenTeams(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'all') {
                        this.teams = data.data.list;
                    }
                }).error();
            },
            getEmail(subscriber){
                if (subscriber.type === 'user') {
                    let users = _.filter(this.users, u => u.id === subscriber.target_id);
                    if (users.length === 1)
                        return users[0].email;
                    else
                        return '';
                } else {
                    return '';
                }
            },
            userProfile(id) {
                this.$router.push(`/users/${id}`);
            },
            profile(subscriber){
                if (subscriber.type === 'team') {
                    this.$router.push(`/teams/${subscriber.target_id}/detail`);
                } else {
                    this.$router.push(`/users/${subscriber.target_id}`);
                }
            }
        }
    }
</script>