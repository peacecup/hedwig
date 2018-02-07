<template>
    <div class="schedules">
        <Row>
            <Col span="24">
            <Row>
                <Col span="8" v-if="!onlyFinal">
                <ButtonGroup>
                    <Button @click="resetToday()">Today</Button>
                    <Button @click="addBeginTime(-1)" icon="chevron-left"></Button>
                    <Button @click="addBeginTime(1)" icon="chevron-right"></Button>
                </ButtonGroup>
                <span>
                        {{beginTimeTag}} <span v-if="endTime"> ~ {{endTimeTag}}</span>
                    </span>
                </Col>
                <Col span="16" v-if="!onlyFinal" style="text-align: right;">
                <ButtonGroup v-if="!onlyFinal">
                    <Button :type="scope === '1d' ? 'primary' : 'default'" @click="changeScope('1d')"> 1 Day


                    </Button>
                    <Button :type="scope === '4d' ? 'primary' : 'default'" @click="changeScope('4d')"> 4 Days





                    </Button>
                    <Button :type="scope === '1w' ? 'primary' : 'default'" @click="changeScope('1w')"> 1 Week





                    </Button>
                    <Button :type="scope === '2w' ? 'primary' : 'default'" @click="changeScope('2w')"> 2 Weeks





                    </Button>
                    <Button :type="scope === '1m' ? 'primary' : 'default'" @click="changeScope('1m')"> 1 Month

                    </Button>
                </ButtonGroup>
                </Col>
                <Col span="24" v-if="!onlyFinal">
                <div class="layers">
                    <h3>Configuration layers</h3>
                    <div class="body">
                        <div class="title" :style="`position: relative;`">
                            <div v-for="(item, index) in schedule.schedule_layers">
                                <div :style="`position:absolute;top:${(index+1) * 40 + 5}px;right:10px;`">
                                    {{item.name}}

                                </div>
                            </div>
                        </div>
                        <div class='content'>
                            <Calendar
                                    :permission="permission"
                                    :schedule_id="schedule.id"
                                    :loading="loading"
                                    :layers="schedule.schedule_layers"
                                    :click1="scheduleOverride"
                                    :click2="viewProfile"
                                    :entries="layerEntris"
                                    :timeRangeChangeCb="timeRangeChange"
                                    :startTime="beginTime"
                                    :scope="scope"></Calendar>
                        </div>
                    </div>
                </div>
                </Col>
                <Col span="24" v-if="!onlyFinal" v-show="layerEntris_override.length !== 0">
                <div class="layers">
                    <h3>Override layers</h3>
                    <div class="body">
                        <div class="title"></div>
                        <div class='content'>
                            <Calendar
                                    :permission="permission"
                                    :schedule_id="schedule.id"
                                    :loading="loading"
                                    :click1="scheduleOverride"
                                    :click2="viewProfile"
                                    :timeRangeChangeCb="timeRangeChange"
                                    :entries="layerEntris_override"
                                    :startTime="beginTime"
                                    :scope="scope"></Calendar>
                        </div>
                    </div>
                </div>
                </Col>
                <Col span="24">
                <div class='layers'>
                    <h3 v-if="!onlyFinal">Final layers</h3>
                    <div class="body">
                        <div v-if="!onlyFinal" class="title"></div>
                        <div class='content'>
                            <div v-if="onlyFinal">
                                <Row type="flex">
                                    <Col style="width:40px;padding:0px;">
                                    <Button style="height:130px" @click="addBeginTime(-1)" icon="chevron-left"></Button>
                                    </Col>
                                    <Col style="flex:1 0 auto;padding:0px;">
                                    <Calendar
                                            :permission="permission"
                                            :schedule_id="schedule.id"
                                            :loading="loading"
                                            :click1="scheduleOverride"
                                            :click2="viewProfile"
                                            :entries="layerEntris_final"
                                            :startTime="beginTime"
                                            :timeRangeChangeCb="timeRangeChange"
                                            :scope="scope"></Calendar>
                                    </Col>
                                    <Col style="width:40px;padding:0px;">
                                    <Button @click="addBeginTime(1)" style="height:130px" icon="chevron-right"></Button>
                                    </Col>
                                </Row>
                            </div>
                            <div v-else>
                                <Calendar
                                        :schedule_id="schedule.id"
                                        :loading="loading"
                                        :click1="scheduleOverride"
                                        :click2="viewProfile"
                                        :entries="layerEntris_final"
                                        :startTime="beginTime"
                                        :timeRangeChangeCb="timeRangeChange"
                                        :scope="scope"></Calendar>
                            </div>

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
        name: 'SchedulesTimeline',
        components: {Calendar, ScheduleInfomation},
        computed: {
        },
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
            this.scope = '2w';
            this.changeScope(this.scope);
            this.dataChange();
        },
        data(){
            return {
                scope: null,
                beginTime: this.getToday(),
                beginTimeTag: null,
                endTime: null,
                endTimeTag: null,
                layers: null,
                layerEntris: [],
                layerEntris_override: [],
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
            timeRangeChange({beginTime, endTime}){
                this.endTime = endTime;
                this.endTimeTag = endTime.format(this.$t('date.MD'));
                this.beginTimeTag = beginTime.format(this.$t('date.MD'));
            },
            resetToday(){
                this.beginTime = this.getToday();
            },
            getToday(){
                return moment().format(this.$t('date.date'));
            },
            changeScope(scope){
                this.scope = scope;
                this.endTime = moment(this.beginTime).add(ScheduleUtil.getStepDays(this.scope, 1), 'd').format(this.$t('date.date'));
                this.timeChange();
            },

            addBeginTime(step){
                this.endTime = moment(this.endTime).add(ScheduleUtil.getStepDays(this.scope, step), 'd').format(this.$t('date.date'))
                this.beginTime = moment(this.beginTime).add(ScheduleUtil.getStepDays(this.scope, step), 'd').format(this.$t('date.date'));
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