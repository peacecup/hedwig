<template>
    <div class="schedule-infomation">
        <Row>
            <Col span="24" v-if="!!schedule.description">
            <strong>Description:</strong>
            <span>{{schedule.description}}</span>
            </Col>
            <Col span="24">
            <strong>On-call now:</strong>
            <span v-if="!schedule.oncall || !schedule.oncall.user.id">Nobody is currently on-call in this schedule</span>
            <span v-else><Button icon="person" size="small"><router-link
                    :to="`/users/${schedule.oncall.user.id}`">{{ schedule.oncall.user.summary
                }}</router-link></Button> ( from {{ formatTime(schedule.oncall.start)
                }} to {{ formatTime(schedule.oncall.end) }} )</span>
            </Col>
            <Col span="24">
            <strong>Your next on-call:</strong>
            <span v-if="!schedule.next_oncall_for_user || !schedule.next_oncall_for_user.start">You are not on-call in this schedule</span>
            <span v-else>you next oncall  from {{formatTime(schedule.next_oncall_for_user.start)
                }} to {{ formatTime(schedule.next_oncall_for_user.end) }}</span>
            </Col>
            <Col span="24">

            <strong>Teams using this schedule:</strong>
            <span style="margin-right:20px;" v-for="team in teams">
                    <Button icon="ios-people" size="small">
                        <router-link :to="`/teams/${team.id}/detail`">{{team.summary}}</router-link>
                    </Button>
                </span>
            </Col>
            <Col span="24">
            <strong style="float:left">Escalation policies using this schedule:</strong>
            <span v-if="policies && policies.length === 0">
                    <div style="width:600px;float:left">
                        <Alert type="warning" style="width:600px;padding: 3px;margin-left:10px;">
                        <Icon type="alert-circled"></Icon>
                        <span>This on-call schedule is not in use. assign it to </span><router-link to="/policies">an escalation policy</router-link>
                   </Alert>
                    </div>
                </span>
            <span v-else>
                    <span style="margin-right:20px;" v-for="policy in policies">
                         <Button icon="alert-circled" size="small">
                            <permission-router-link :target="policy" type="policy">{{p.summary}}</permission-router-link>
                         </Button>
                    </span>
                </span>
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
        name: 'ScheduleInfomation',
        components: {},
        computed: {
            ...VueUtil(this).select(['Schedules','EscalationPolicies']).state(),
        },
        props: {
            schedule: {
                type: Object
            }
        },

        data(){
            return {
                teams: null,
                policies: null,
                loading: false,
            };
        },
        watch: {
            schedule(val){
                if(val.id){
                    this.getPolicies();
                }
            },
            "EscalationPolicies.listBySchedule": "listenEscalationPolicies",
        },
        methods: {
            ...VueUtil(this).select(['Schedules','EscalationPolicies']).actions(),
            formatTime(time){
                let m = moment(time);
                return m.format("MMM DD") + ' at ' + m.format('HH:mm A');
            },
            getPolicies(){
                VueUtil(this).select('EscalationPolicies').action('listBySchedule', {
                    schedulesId: this.schedule.id,
                    include: ["teams"],
                });
            },
            listenEscalationPolicies(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'listBySchedule' && data.request.schedulesId === this.schedule.id) {
                        this.policies = data.data.list;
                        let teams = [];
                        _.forEach(data.data.list, es => {
                            _.forEach(es.teams, t => {
                                let f = true;
                                _.forEach(teams, t1 => {
                                    if (t1.id === t.id) f = false;
                                });
                                if (f) teams.push(t);
                            })
                        });
                        this.teams = teams;
                    }
                }).error();
            },
        }
    }
</script>