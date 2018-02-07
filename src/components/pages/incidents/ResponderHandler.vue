<template>
    <div class="responder-handler">
        <Alert type="warning" v-if="incidents.length > 0">
            <Form>
                <Row v-for="incident in incidents" :key="incident.id">
                    <Col span="24">
                    <strong>Response requested by {{_.get(incident, 'assignments[0].assignee.summary', '')
                        }} for [#{{incident.incident_number}}] {{incident.title}}</strong>
                    at {{moment(incident.last_status_change_at).format('HH:mm') }}
                    <router-link :to="`/incidents/${incident.id}`">View incident</router-link>
                    </Col>
                    <Col span="24">
                    Please help with "[#{{ incident.incident_number }}] {{ incident.title }}"
                    </Col>
                    <Col span="24">
                    <Input style="max-width: 400px;" v-model="incident.message" :rows="4" type="textarea"
                           placeholder="Add a message…"/>
                    </Col>
                    <Col span="24">
                    <Button :loading="loading" icon="ios-checkmark" type="success" :disabled="!incident.message || incident.message.length === 0" size="small" @click="responderReply(incident, 'joined')">Accept</Button>
                    <Button :loading="loading" icon="ios-minus" size="small" @click="responderReply(incident, 'declined')">Decline</Button>
                    <div class="divider top-bottom-5" v-if="incidents.length > 1"></div>
                    </Col>
                </Row>
            </Form>
        </Alert>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import {VueUtil, FormUtil} from '@util';
    import store from 'store';

    export default{
        name: 'ResponderHandler',
        components: {},
        computed: {
            ...VueUtil(this).select(['Incidents']).state(),
        },
        props: {
            incident: {
                type: Object,
                default: ()=>{
                    return {
                        message: "",
                    }
                }
            },
            success: {
                type: Function,
            }
        },

        data(){
            return {
                incidents: [],
                loading:false,
            }
        },
        mounted(){


            this.getResponderToMe();
        },
        watch: {
            'incident': 'listenIncident',
            'Incidents.responder_to_me': 'listenIncidents',
            'Incidents.responderReply': 'listenIncidents',
        },
        methods: {
            ...VueUtil(this).select(['Incidents']).actions(),
            getResponderToMe(){
                VueUtil(this).select("Incidents").action('responder_to_me', {
                    responder_user_ids: [store.get("id")],
                    responder_states: ['pending'],
                    include: ["assignees", "services"],
                })
            },
            listenIncident(data){
                this.incidents = _.chain(_.get(this.Incidents,"responder_to_me.data.list",[])).filter(item => item.id === this.incident.id).map(item => {
                    return {
                        ...item,
                        message: null,
                    }
                }).value();

            },
            listenIncidents(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'responder_to_me') {
                        setTimeout(()=>{
                            if (this.incident.id) {
                                this.incidents = _.chain(data.data.list).filter(item => item.id === this.incident.id).map(item => {
                                    return {
                                        ...item,
                                        message: null,
                                    }
                                }).value();
                            } else {
                                this.incidents =_.map(data.data.list,item=>{
                                    return {
                                        ...item,
                                        message: null,
                                    }
                                });
                            }
                            this.loading = false;
                        },600);
                    } else if (data.type === 'responderReply') {
                        this.$Message.success('reply access!');
                        this.getResponderToMe();
                    }
                }).error();
            },
            responderReply(incident, status){
                this.loading = true;
                VueUtil(this).select("Incidents").action('responderReply',{
                    id: incident.id,
                    incidents_responders: [
                        {
                            state: status,
                            message: incident.message,
                            user: {
                                id: store.get("id"),
                            }
                        }
                    ]
                })
            }
        }
    }
</script>