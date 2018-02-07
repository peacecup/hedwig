<template>
    <div class="schedules">
        <Row>
            <Col span="24">
            <Row>
                <Col span="12">
                <ButtonGroup>
                    <Button @click="resetToday()">Today</Button>
                    <Button @click="addBeginTime(-1)" icon="chevron-left"></Button>
                    <Button @click="addBeginTime(1)" icon="chevron-right"></Button>

                </ButtonGroup>

                </Col>
                <Col span="12">
                <h1>
                        {{ month_first_day.format($t('date.YM')) }}
                    </h1>
                </Col>
                <Col span="24">
                <div class='layers'>
                    <div class="body">
                        <div class='content'>
                            <div class="calendar" style="height: 30px;min-height:30px;">
                                <div class="block" style="width: 14.2857%;height: 30px;display: block;">
                                    <div class="text-align-center"><strong>Sun</strong></div>
                                </div>
                                <div class="block" style="width: 14.2857%;height: 30px;display: block;">
                                    <div class=" text-align-center"><strong>Monday</strong></div>
                                </div>
                                <div class="block" style="width: 14.2857%;height: 30px;display: block;">
                                    <div class=" text-align-center"><strong>Tuesday</strong></div>
                                </div>
                                <div class="block" style="width: 14.2857%;height: 30px;display: block;">
                                    <div class=" text-align-center"><strong>Wednesday</strong></div>
                                </div>
                                <div class="block" style="width: 14.2857%;height: 30px;display: block;">
                                    <div class=" text-align-center"><strong>Thursday</strong></div>
                                </div>
                                <div class="block" style="width: 14.2857%;height: 30px;display: block;">
                                    <div class=" text-align-center"><strong>Friday</strong></div>
                                </div>
                                <div class="block" style="width: 14.2857%;height: 30px;display: block;">
                                    <div class=" text-align-center"><strong>Saturday</strong></div>
                                </div>
                            </div>
                            <Calendar v-for="(time,index) in times"
                                      :key="index"
                                      :permission="permission"
                                      :schedule_id="schedule.id"
                                      :format="'D'"
                                      :loading="loading"
                                      :click1="scheduleOverride"
                                      :click2="viewProfile"
                                      :entries="layerEntris_final"
                                      :startTime="time.beginTime"
                                      :scope="scope"></Calendar>
                        </div>
                    </div>
                </div>
                </Col>
            </Row>
            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import store from 'store';
    import moment from 'moment';
    import Calendar from './Calendar.vue';
    import ScheduleInfomation from './ScheduleInfomation.vue';
    import {VueUtil, FormUtil, ScheduleUtil} from '@util';

    export default{
        name: 'SchedulesFullCalendar',
        components: {Calendar, ScheduleInfomation},
        computed: {},
        props: {
            schedule: {
                type: Object,
            },
            onlyFinal: {
                type: Boolean,
                default: false,
            },
            changeScopeCb: {
                type: Function,
            },
            scheduleOverride: {
                type: Function,
            },
            loading: {
                type: Boolean,
                default: false,
            },
            permission: {
                type: Boolean,
                default: false,
            }

        },
        mounted(){

            this.scope = '1w';
            this.changeScope(this.scope);
            this.dataChange();
        },
        data(){

            let month_first_day = moment().date(1);
            let first = this.getFirstDay(month_first_day).format(this.$t('date.date'));

            let times = [];
            for (let i = 0; i < 6; i++) {
                times.push({
                    beginTime: moment(first).add(i, 'w'),
                })
            }

            return {
                times,
                month_first_day: moment().date(1),
                scope: null,
                beginTime: times[0].beginTime.format(this.$t('date.date')),
                endTime: null,
                layers: null,
                layerEntris_final: [],
                override: null,
            }
        },

        watch: {
            "schedule": {
                handler: "dataChange",
                deep: true,
            },
            "beginTime": "timeChange",
        },
        methods: {
            dataChange(data){
                //计算layer entry
                let layerEntris = [];
                let i = 1;
                _.forEach(_.get(this.schedule, "schedule_layers", []), layer => {
                    layerEntris = layerEntris.concat(_.map(layer.rendered_schedule_entries, e => {
                        return {
                            ...e,
                            top: i * 40,
                        }
                    }));
                    i++;
                });
                this.layerEntris = layerEntris;

                //计算override entry
                let layerEntris_override = [];
                _.forEach(_.get(this.schedule, "overrides_subschedule.rendered_schedule_entries", []), entries => {
                    layerEntris_override.push({
                        ...entries,
                        top: 40,
                    })
                });
                this.layerEntris_override = layerEntris_override;

                //计算 final entry
                this.layerEntris_final = _.map(_.get(this.schedule, "final_schedule.rendered_schedule_entries", []), e => {
                    return {...e, top: 40};
                });
            },
            showScheduleInfomation(){
                this.infomationModal = !this.infomationModal;
            },

            viewProfile(data){
                this.$router.push(`/users/${data.user.id}`)
            },

            resetToday(){
                this.month_first_day = moment().date(1);
                this.beginTime = this.month_first_day.format(this.$t('date.date'));
                this.addBeginTime(0);
            },
            getToday(){
                return this.getFirstDay(moment()).format(this.$t('date.date'));
            },
            changeScope(scope){
                this.scope = scope;
                this.endTime = moment(this.beginTime).add(42, 'd').format(this.$t('date.date'));
                this.timeChange();
            },

            addBeginTime(step){
                let month = this.month_first_day.months() + step;
                if (month === 12) {
                    this.month_first_day.year(this.month_first_day.years() + 1).month(0);
                } else if (month === -1) {
                    this.month_first_day.year(this.month_first_day.years() - 1).month(11);
                } else {
                    this.month_first_day.month(month);
                }
                let first = this.getFirstDay(moment(this.month_first_day.format(this.$t('date.date')))).format(this.$t('date.date'));
                let times = [];
                for (let i = 0; i < 6; i++) {
                    times.push({
                        beginTime: moment(first).add(i, 'w'),
                    })
                }
                this.times = times;
                this.beginTime = times[0].beginTime.format(this.$t('date.date'));
                this.endTime = moment(times[5].beginTime.format(this.$t('date.date'))).add(1, 'w').format(this.$t('date.date'));
            },

            timeChange(){
                this.changeScopeCb({
                    start: this.beginTime,
                    end: this.endTime,
                });
            },
            getFirstDay(time){
                return time.add(time.day() * (-1), 'd');
            },
        }
    }
</script>