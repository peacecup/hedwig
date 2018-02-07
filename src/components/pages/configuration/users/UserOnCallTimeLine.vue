<template>
    <div class="user-oncall-timeline oncall">
        <Row>
            <Col span="12">
            <h2>On-Call Timeline</h2>
            <div class="divider"></div>
                <Row type="flex">
                    <Col span="4" offset="1" class="text-align-right">
                        <div v-for="entry in entries" style="height: 240px;">
                            <div  style="height: 80px;display:flex;flex-direction: column;justify-content: space-between; ">
                                <div>{{ moment(entry.start).format($t('date.MDTime')) }}</div>
                                <div>{{ moment(entry.end).format($t('date.MDTime')) }}</div>
                            </div>
                        </div>
                    </Col>
                    <Col :style="`border-right:1px dashed #333;width:30px;height: ${entries.length * 240 + 150}px;`">
                    <template v-if="entries.length === 0">
                        <div class="timeline" style="height: 90px;background:#ffffff;border:1px dashed #333;"></div>
                    </template>
                    <template v-else>
                        <template v-for="(entry,index) in entries">
                            <div class="timeline" :style="`top:${index * 240 }px ;height: 90px;background:${user.color};`"></div>
                            <div class="timeline" :style="`top:${index * 240 + 120 }px ;height: 90px;background:#ffffff;border:1px dashed #333;`"></div>
                        </template>
                    </template>

                    </Col>
                    <Col style="padding-left:20px;">
                    <template v-if="entries.length === 0">
                        <div :style="`width:300px;position:absolute;top:40px`">No scheduled on-call </div>
                    </template>
                    <template v-else>
                        <template v-for="(entry,index) in entries">
                            <div :style="`width:300px;position:absolute;top:${index * 240 + 160}px`">No scheduled on-call </div>
                        </template>
                    </template>

                    </Col>
                </Row>
            </Col>
            <Col span="12">
            <H2>Always On Call</H2>
            <div class="divider"></div>
            <UpcomingOnCall :user="user" type="chart"></UpcomingOnCall>
            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import UpcomingOnCall from './UpcomingOnCall.vue';
    import {VueUtil, ScheduleUtil} from '@util';
    import Vue from 'vue';
    import moment from 'moment';

    export default{
        name: 'UserOnCallTimeLine',
        components: {
            UpcomingOnCall,
        },
        computed: {
            ...VueUtil(this).select(['Schedules']).state(),
        },
        props: {
            user: {
                type: Object,
            }
        },

        data(){
            return {
                entries: [],
                params: {
                    since: ScheduleUtil.momentToString(moment()),
                    until: ScheduleUtil.momentToString(moment().add(14, 'd')),
                },
            }
        },
        mounted(){
        },
        watch: {
            'Schedules.listByUser': 'listenSchedules',
            'Schedules.get': 'listenSchedules',
        },
        methods: {
            ...VueUtil(this).select(['Schedules']).actions(),
            listenSchedules(data) {
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'listByUser') {
                        this.schedules = data.data.list;
                        _.forEach(this.schedules, (schedule) => {
                            VueUtil(this).select('Schedules').get({
                                id: schedule.id,
                                time_zone: Vue.config.timezone,
                                since: this.params.since,
                                until: this.params.until,
                            });
                        });

                    } else if (data.type === 'get') {
                        this.entries = _.concat(this.entries,_.chain(this.schedules).filter(schedule => schedule.id === data.data.id).map(schedule => {
                            return _.chain(data.data.final_schedule.rendered_schedule_entries).filter(entry => {
                                return entry !== null && entry.user.id === this.user.id;
                            }).map(entry => {
                                return entry;
                            }).value();
                        }).flatten().value());
                    }
                }).error();
            }
        }
    }
</script>