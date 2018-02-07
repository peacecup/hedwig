<template>
    <Row type="flex">
        <Col span="24">
            <Row type="flex" style="width: 100%;border-bottom: 1px solid #e9eaec">
                <Col span="24">
                    <h1>Reports</h1>
                </Col>   
            </Row>
            <Row type="flex">
                <Col span="17">
                    <Tabs value="notifications" v-model="chartType" @on-click="getChartData">
                        <TabPane label="Notifications" name="notifications">
                        </TabPane>
                        <TabPane label="Incidents" name="incidents">
                        </TabPane>
                    </Tabs>
                </Col>
                <Col>
                    &nbsp;
                    <ButtonGroup>
                        <Button :type="rollup ==='daily' ?'primary':'default'"  @click="chooseRollup(0)">Day</Button>
                        <Button :type="rollup ==='weekly' ?'primary':'default'"   @click="chooseRollup(1)">Week</Button>
                        <Button :type="rollup ==='monthly' ?'primary':'default'" @click="chooseRollup(2)">Month</Button>
                    </ButtonGroup>
                    &nbsp;&nbsp;
                    <DatePicker type="daterange" confirm @on-ok="getChartData" v-model="dataPickerTime" format="yyyy/MM/dd" :options="timeOption" placement="bottom-end" placeholder="选择日期" style="width: 200px"></DatePicker>
                </Col>
            </Row>
            <Row>
                <Col span="23">
                    <div id="main" style="height:400px;"></div>
                </Col>
            </Row>
        </Col>
        <Col>
            <Row>
                <Col span="24">
                    <Table :loading="loading" :no-data-text="noDataText" size="small" :columns="columns" ></Table>
                </Col>
            </Row>
        </Col>
    </Row>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';
    import moment from 'moment';
    import echarts from 'echarts';
    import Vue from 'vue';
    Vue.prototype.$echarts = echarts;

    export default{
        components: {},
        computed: {
            ...VueUtil(this).select(['Reports']).state(),
        },
        methods: {
            ...VueUtil(this).select(['Reports']).actions(),
            initDataPickerTime(){
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                return [start, end];
            },
            chooseRollup(arg){
                const rollupArr = ['daily','weekly','monthly'];
                this.rollup = rollupArr[arg];
                this.getChartData();
            },
            getChartData(){
                // console.log(this.rollup);
                // console.log(this.chartType);
                // console.log(this.dataPickerTime);
                // let startTime = moment(this.dataPickerTime[0]).format(this.$t("date.date"));
                // let endTime = moment(this.dataPickerTime[1]).format(this.$t("date.date"));
                // console.log(startTime);
                // console.log(endTime);

                this.query = {
                    rollup: this.rollup,
                    since: moment(this.dataPickerTime[0]).format(this.$t("date.date"))+'T00:00:00',
                    until: moment(this.dataPickerTime[1]).format(this.$t("date.date"))+'T23:59:59',
                    time_zone: 'Asia/Shanghai', 
                }
                if('notifications'===this.chartType){
                    VueUtil(this).select("Reports").action("get_alerts_report", this.query);
                }else{
                    VueUtil(this).select("Reports").action("get_incidents_report", this.query);
                }

                //hui diao
                this.drawEcharts();

            },
            listenAlertsReports(data){
                // VueUtil(this)
                //   .cb(data)
                //   .success(() => {
                    

                //   })
                //   .error();
                //this.drawEcharts();
            },
            listenIncidentsReports(){
                //this.drawEcharts();
            },
            drawEcharts(){
                let myChart = echarts.init(document.getElementById('main'));
                myChart.setOption({
                    title: {
                        text: this.chartType.toUpperCase()
                    },
                    tooltip : {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#6a7985'
                            }
                        }
                    },
                    legend: {
                        data: this.legendData,
                        // formatter:function (name) {
                        //     return 'Legend ' + name;
                        // },                  
                    },
                    toolbox: {
                        feature: {}
                    },
                    grid: {
                        //表的位置
                        left: '3%',
                        right: '3%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis : [
                        {
                            type : 'category',
                            boundaryGap : false,
                            data : ['1','2','3','4','5','6','7','9','10','11','12','13','14',
                            '15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value'
                        }
                    ],
                    series : [
                        {
                            name:'Phone',
                            type:'line',
                            stack: '总量',
                            areaStyle: {normal: {}},
                            data:[0, 0, 0, 0, 90, 230, 210, 0, 220, 20, 0, 0, 0, 0, 90, 230, 210, 0, 220, 20, 0, 0, 0, 0, 90, 230, 210, 0, 220, 20]
                        }
                    ]
                });
            }

        },
        mounted(){
            this.getChartData();
        },
        watch: {
            "Reports.get_alerts_report": "listenAlertsReports",
            "Reports.get_incidents_report": "listenIncidentsReports",
        },
        props: {},
        data(){
            const timeOption = {
                shortcuts: [
                    {
                        text: 'Last Month',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            return [start, end];
                        }
                    },
                    {
                        text: 'Last 3 Months',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            return [start, end];
                        }
                    },
                    {
                        text: 'Last 6 Months',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
                            return [start, end];
                        }
                    },
                ]
            };
            const fields = [
                {
                    label: "DateRange",
                    id: "DateRange",
                    type: "select",
                    forever: true,
                    span: 22,
                    formIndex: 0,
                },
                {
                    label: "Email",
                    id: "Email",
                    type: "select",
                    forever: true,
                    span: 22,
                    formIndex: 1,
                },
                {
                    label: "SMS",
                    id: "SMS",
                    type: "select",
                    forever: true,
                    span: 22,
                    formIndex: 2,
                },
                {
                    label: "Phone",
                    id: "Phone",
                    type: "select",
                    forever: true,
                    span: 22,
                    formIndex: 3,
                },
                {
                    label: "Push",
                    id: "Push",
                    type: "select",
                    forever: true,
                    span: 22,
                    formIndex: 4,
                },
                {
                    label: "Total",
                    id: "Total",
                    type: "select",
                    forever: true,
                    span: 22,
                    formIndex: 5,
                },
                {
                    label: "Actions",
                    id: "Actions",
                    type: "select",
                    forever: true,
                    span: 22,
                    formIndex: 6,
                },
            ];
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            const columns = [...formUtil.columns()];
            return {
                dataPickerTime: this.initDataPickerTime(),
                timeOption,
                rollup: 'daily',
                chartType: 'notifications',
                query: {},

                //echart
                legendData: ['Phone','SMS','Email','Push'],

                //data
                noDataText: "No data found with current filters.",
                loading: false,
                columns: columns,

            }
        }
    }
</script>