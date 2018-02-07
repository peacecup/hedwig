<template>
    <Row>
        <Col span="24">
        <ScheduleInfomation :schedule="schedule_view"></ScheduleInfomation>
        </Col>
        <Col span="24">
        <SchedulesTimeline :loading="loading" :changeScopeCb="changeScope" :onlyFinal="true"
                           :schedule="schedule_view"></SchedulesTimeline>
        </Col>
    </Row>
</template>

<script>
    import _ from 'lodash';
    import store from 'store';
    import moment from 'moment';
    import Vue from 'vue';
    import Calendar from './Calendar.vue';
    import ScheduleInfomation from './ScheduleInfomation.vue';
    import SchedulesTimeline from './SchedulesTimeline.vue';
    import {VueUtil, FormUtil, ScheduleUtil} from '@util';

    export default{
        name: 'SchedulesListItem',
        components: {Calendar, ScheduleInfomation, SchedulesTimeline},
        computed: {
            ...VueUtil(this).select(['Schedules', 'EscalationPolicies']).state(),
        },
        props: {
            schedule: {
                type: Object,
            }
        },

        data(){
            return {
                schedule_view: {},
                loading: false,
                next_oncall_for_user:null,
                oncall:null,
                params: {
                    since: ScheduleUtil.momentToString(moment().add(-1, 'd')),
                    until: ScheduleUtil.momentToString(moment().add(30, 'd')),
                },
            }
        },
        mounted(){
//            this.get();
        },
        watch: {
            "Schedules.get": "listenSchedules",
        },
        methods: {
            ...VueUtil(this).select(['Schedules', 'EscalationPolicies']).actions(),
            get(oncall = true){
                this.loading = true;
                let params = {
                    id: this.schedule.id,
                    time_zone: Vue.config.timezone,
                    since: this.params.since,
                    until: this.params.until,

                }
                if (oncall) {
                    params.include_oncall = true;
                    params.include_next_oncall_for_user = store.get('id');
                }
                VueUtil(this).select('Schedules').get(params);
            },

            changeScope(params){
                if (ScheduleUtil.momentToString(moment(params.start)) === this.params.since) {
                    return;
                }
                this.params = {
                    since: ScheduleUtil.momentToString(moment(params.start)),
                    until: ScheduleUtil.momentToString(moment(params.start).add(14, 'd'))
                }
                this.get(false);
            },

            listenSchedules(data){
                VueUtil(this).cb(data).success(() => {
                    if (this.schedule.id === data.data.id) {
                        if (data.type === 'get') {
                            if(data.request.include_oncall) {
                                this.include_oncall = data.data.include_oncall;
                                this.next_oncall_for_user = data.data.next_oncall_for_user;
                                this.schedule_view = data.data;
                            }else {
                                this.schedule_view = {
                                    ...data.data,
                                    include_oncall: this.include_oncall,
                                    next_oncall_for_user: this.next_oncall_for_user,
                                };
                            }
                            this.loading = false;
                            this.schedule.name = data.data.name;
                        }
                    }

                }).error();
            },
        }
    }
</script>