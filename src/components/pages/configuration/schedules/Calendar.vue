<template>
    <div class="calendar" :style="`height:${calendarHeight}px`">
        <Spin fix size="large" v-if="loading">
            <slot name="loading">&nbsp;</slot>
        </Spin>
        <!--<Spin fix v-if="loading" size="large"></Spin>-->
        <div class="bg" :style="`width:${bgWidth}`"></div>
        <div :style="`width:${blockStyle.width}`"
             :class="`block ${t.title.indexOf('Sa') === 0 ? 'block-right-divider':''}`" v-for="t in tblocks">
            <div class="title">
                <div class="firstday" v-if="t.day === '1'">{{t.month}}</div>
                {{t.title}}


            </div>
            <div v-if="t.columns" class="title-secondary" v-for="tt in t.columns"></div>
        </div>

        <div class="entries" v-for="event in renderEntries"
             :style="`width:${event.width};left:${event.left};background: ${event.color};top:${event.top}px;z-index:${event.zIndex}`">
            <Poptip v-if="click2" class="event-poptip" :transfer="true" trigger="click" :title="event.title">
                <div class="poptip-body">{{event.title}}</div>
                <div class="api" slot="content">
                    <Row type="flex">
                        <Col span="12">
                        From: </Col>
                        <Col span="12">
                        {{moment(event.start).format($t('date.MDTime'))}}
                        </Col>
                        <Col span="12">
                        To: </Col>
                        <Col span="12">
                        {{moment(event.end).format($t('date.MDTime'))}}
                        </Col>
                    </Row>
                    <div class="divider"></div>
                    <Row type="flex">
                        <Col span="24" v-key="{key:`schedule.override`, ignore:permission}">
                        <Button v-if="schedule_id && click1" @click="click1(event)"
                                style="width:100%;margin-top:5px;text-align: left;"
                                icon="calendar" size="small">Schedule On Override


                        </Button>
                        </Col>
                        <Col span="24">
                        <Button @click="click2(event)" style="width:100%;margin-top:5px;text-align: left;"
                                icon="person" size="small">View profile


                        </Button>
                        </Col>
                    </Row>
                </div>
            </Poptip>
            <div v-else class="entry-title">{{event.title}}</div>
        </div>
        </Poptip>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'Calendar',
        components: {},
        computed: {
            //...VueUtil(this).select(['Calendar']).state(),
        },
        props: {
            schedule_id: {
                type: [String, Number]
            },
            scope: {
                type: String
            },
            startTime: {
                type: [Object, String]
            },
            timeRangeChangeCb: {
                type: Function
            },
            entries: {
                type: Array
            },
            click1: {
                type: Function
            },
            click2: {
                type: Function
            },
            layers: {
                type: Array
            },
            loading: {
                type: Boolean,
                default: false,
            },
            permission:{
                type: Boolean,
                default: false,
            },
            format: {
                type: String,
            }
        },

        data(){
            return {
                tblocks: [],
                blockStyle: {},
                renderEntries: [],
                bgWidth: null,
                calendarHeight: 80,
            }
        },
        mounted(){

//            this.changeScope(this.scope);
        },
        watch: {
            scope: 'changeScope',
            startTime: 'changeScope',
            entries: {
                handler: "changeRange",
                deep: true,
            },
        },
        methods: {
            getRange(){
                try {
                    let _endTime = _.cloneDeep(this.tblocks[this.tblocks.length - 1].time);
                    let range = {
                        beginTime: this.tblocks[0].time,
                        endTime: this.scope === '1d' ? _endTime.add(4, 'h') : _endTime.add(1, 'd'),
                    };
                    return range;
                } catch (e) {
                    return {beginTime: moment(), endTime: moment()};
                }

            },
            changeRange(data){
                if (_.isUndefined(data)) return;
                this.calendarHeight = !!this.layers ? (this.layers.length * 40 + 60) : 80;
                let range = this.getRange();
                let ruler = range.endTime.diff(range.beginTime, 'd', true);

                //计算今天的位置,用于渲染背景
                let bgWidth = ( moment().diff(range.beginTime, 'd', true) / ruler * 100);
                if (bgWidth < 0)
                    bgWidth = 0;
                this.bgWidth = bgWidth + '%';
                //计算今天的位置,用于渲染背景
                //计算每个事件条的宽度和偏移量
                if (this.entries) {
                    let width;
                    let left;
                    let display = 'block';
                    this.renderEntries = _.chain(this.entries).filter(item => { //过滤掉超出当前选择范围的事件, 优化性能
                        return !(moment(item.end).isBefore(range.beginTime) || moment(item.start).isAfter(range.endTime));
//                        return true;
                    }).map(item => {
                        let b = moment(item.start);
                        let e = moment(item.end);
                        if (b.isBefore(range.beginTime)) {
                            b = range.beginTime;
                        }
                        if (e.isAfter(range.endTime)) {
                            e = range.endTime;
                        }
                        if (e.isBefore(range.beginTime) || b.isAfter(range.endTime)) {
                            width = 0;
                            left = 0;
                        } else {
                            width = (e.diff(b, 'd', true) / ruler * 100);
                            left = (b.diff(range.beginTime, 'd', true) / ruler * 100);
                            if (width <= 0)
                                width = 0;
                            if (left < 0)
                                left = -20;
                            width = width + '%';
                            left = left + '%';
                        }
                        return {...item, width, left, display, title: item.user.summary, color: item.user.color,};
                    }).value();
                }
                //计算每个事件条的宽度和偏移量 end
                if (this.timeRangeChangeCb) {
                    this.timeRangeChangeCb(range);
                }
            },
            log(logs){
//                _.forEach(logs, log => {
//                    console.log(log.format('MM-DD'))
//                })
            },
            changeScope(){
                switch (this.scope) {
                    case '1d':
                        this.renderDay();
                        break;
                    case '4d':
                        this.render4Day();
                        break;
                    case '1w':
                        this.render1W();
                        break;
                    case '2w':
                        this.render2W();
                        break;
                    case '1m':
                        this.render1M();
                        break;
                }
            },
            cap(dm, time){
                let title = time.format(dm);
                let month = time.format(this.$t('date.month'));
                let smonth = time.format(this.$t('date.smonth'));
                let day = time.format('D');
                return {time, title, month, smonth, day};
            },

            renderDayAddSomeDays(begin, addDays){
                if (!_.isNumber(addDays) || addDays < 0)
                    throw new Error('error params [addDays]!');
                let dm = addDays > 14 ? 'D' : 'dd M/D';
                if (this.format) {
                    dm = this.format;
                }
                var times = [];
                for (let i = 0; i < addDays; i++) {
                    let time = moment(begin || new Date()).add(i, 'd');
                    times.push(this.cap(dm, time));
                }
                var blockStyle = {
                    width: (100.0 / times.length) + '%'
                }
                this.blockStyle = blockStyle;
                this.tblocks = times;
                this.changeRange();
            },
            render4Day(){
                this.renderDayAddSomeDays(this.startTime, 4);
            },
            render1W(){ //从选中日期所在周的第一天开始计算
                this.renderDayAddSomeDays(this.startTime, 7);
            },
            render2W(){ //从选中日期所在周的第一天开始计算
                this.renderDayAddSomeDays(this.startTime, 14);
            },
            render1M(){
                this.renderDayAddSomeDays(this.startTime, 31);
            },

            renderDay(){
                let startTime = moment(this.startTime);
                var times = [{
                    title: '00:00',
                    time: _.cloneDeep(startTime),
                    columns: ['01:00', '02:00', '03:00', '04:00']
                }, {
                    title: '04:00',
                    time: _.cloneDeep(startTime.add(4, 'h')),
                    columns: ['05:00', '06:00', '07:00', '08:00']
                }, {
                    title: '08:00',
                    time: _.cloneDeep(startTime.add(4, 'h')),
                    columns: ['09:00', '10:00', '11:00', '12:00']
                }, {
                    title: '12:00',
                    time: _.cloneDeep(startTime.add(4, 'h')),
                    columns: ['13:00', '14:00', '15:00', '16:00']
                }, {
                    title: '16:00',
                    time: _.cloneDeep(startTime.add(4, 'h')),
                    columns: ['17:00', '18:00', '19:00', '20:00']
                }, {
                    title: '20:00',
                    time: _.cloneDeep(startTime.add(4, 'h')),
                    columns: ['21:00', '22:00', '23:00', '24:00']
                },];

                var blockStyle = {
                    width: (100.0 / times.length) + '%'
                }
                this.blockStyle = blockStyle;
                this.tblocks = times;
                this.changeRange();
            }
            //...VueUtil(this).select(['Calendar']).actions(),
        }
    }
</script>