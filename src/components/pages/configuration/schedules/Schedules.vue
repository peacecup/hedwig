<template>
    <div class="schedules">
        <Row>
            <Col span="24">
            <Row>
                <Col span="12">
                <Row>
                    <Col span="12">
                    <h1>{{title}} </h1></Col>
                    <Col span="8" style="line-height: 40px;">
                    <Icon type="earth"></Icon>
                    timezone: {{timezone}}</Col>
                </Row>
                </Col>

                <Col span="12" style="text-align: right;">
                <Form ref="queryForm" :model="query" onSubmit="return false;">
                    <Input :maxlength="30" v-model="query.query" icon="search" placeholder="search..."
                           style="width:200px;margin-right:10px;"/>
                    <Button style="display: none" htmlType="submit" @click="changePage(1)" icon="search"></Button>
                    <Button v-key="`schedule.new`" @click="newSchedules" type="success" icon="plus">
                        New On-Call Schedule
                    </Button>
                </Form>

                </Col>
            </Row>

            </Col>
            <Col span="24">
            <div class="divider"></div>
            <Row>
                <Col span="24" style="text-align: right">
                <Page :page-size="query.limit" :total="Schedules.list.data.total"
                      :current="Schedules.list.data.offset" size="small"
                      @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                      show-sizer></Page>
                </Col>
                <Col span="24">
                <Spin fix size="large" v-if="Schedules.list.loading"></Spin>
                <Alert style="text-align: center" v-if="schedules.length === 0">
                    No schedules found with current filters.


                </Alert>
                <Card style="margin-bottom: 10px; padding:0px;" v-for="schedule in schedules" :key="schedule.id">
                    <div slot="title">
                        <Row type="flex">
                            <Col span="12">
                            <Icon type="calendar"></Icon>
                            <permission-router-link :target="schedule" type="schedule">{{schedule.name}}</permission-router-link>
                            </Col>
                            <Col span="12" style="text-align: right">
                            <DropMenuDecorator :id="schedule.id" title="Operate" :select="operate" target="schedule"
                                               :list="list"></DropMenuDecorator>
                            </Col>
                        </Row>
                    </div>
                    <div class="body">
                        <SchedulesListItem :key="schedule.id" :schedule="schedule"></SchedulesListItem>
                    </div>
                </Card>
                </Col>
                <Col span="24" style="text-align: right">
                <Page :page-size="query.limit" :total="Schedules.list.data.total"
                      :current="Schedules.list.data.offset" size="small"
                      @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                      show-sizer></Page>
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
    import Vue from 'vue';
    import Calendar from './Calendar.vue';
    import ScheduleInfomation from './ScheduleInfomation.vue';
    import SchedulesTimeline from './SchedulesTimeline.vue';
    import SchedulesListItem from './SchedulesListItem.vue';
    import {VueUtil, FormUtil, ScheduleUtil, PermissionUtil} from '@util';

    export default{
        name: 'Schedules',
        components: {Calendar, ScheduleInfomation, SchedulesTimeline, SchedulesListItem},
        computed: {
            ...VueUtil(this).select(['Schedules', 'Teams']).state(),
        },
        data(){
            const rowMenuList = [
                {title: "view", icon: "search", type: 'view', key: 'schedule.read'},
                {title: "edit", icon: "edit", type: 'edit', key: 'schedule.edit'},
                {title: "delete", icon: "trash-a", type: 'delete', key: 'schedule.delete'},
            ];
            const query = FormUtil(this).defaultQuery();
            return {
                timezone: Vue.config.timezone,
                title: "On Call Schedules on All Teams",
                query,
                list: rowMenuList,
                infomationModal: false,
                schedules: [],
                since: ScheduleUtil.momentToString(moment().add(-1, 'd')),
                until: ScheduleUtil.momentToString(moment().add(30, 'd')),
            }
        },
        mounted(){
            this.listenChooseTeams(this.Teams.choose);
            this.changePage();
        },
        watch: {
            "Schedules.delete": "listenSchedules",
            "Schedules.list": "listenSchedules",
            "Teams.choose": "listenChooseTeams",
        },
        methods: {
            ...VueUtil(this).select(['Schedules', 'Teams']).actions(),

            scheduleToEvents(schedule){
                return ScheduleUtil.scheduleToEvents(schedule);
            },

            editSchedule(){
                this.$router.push("/schedules/1/edit");
            },
            changeScope({start, end}){
                if (start)
                    this.since = ScheduleUtil.momentToString(moment(start));
                if (end)
                    this.until = ScheduleUtil.momentToString(moment(end));
            },
            showScheduleInfomation(){
                this.infomationModal = !this.infomationModal;
            },

            changePage(page){
                page ? this.query.offset = page : null;
                VueUtil(this).select('Schedules').list(this.query);
            },
            changePageSizer(pageSize){
                this.query.limit = pageSize;
                VueUtil(this).select('Schedules').list(this.query);
            },
            listenChooseTeams(team){
                if (_.get(team, 'data.id', null)) {
                    this.query.team_ids = [team.data.id];
                    this.title = `On Call Schedules on ${team.data.name}`;
                } else {
                    this.query.team_ids = null;
                    this.title = `On Call Schedules on All Teams`;
                }
                this.changePage(1);
            },
            listenSchedules(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'list') {
                        this.schedules = data.data.list;
                    } else {
                        this.$Message.success(`${data.type} success!`);
                        setTimeout(() => {
                            this.modal = false;
                            this.changePage();
                        }, 600);
                    }
                }).error();
            },
            newSchedules(){
                this.listenChooseTeams(this.Teams.choose);
                this.$router.push('/schedules/new');
            },
            operate(id){
                let $id = id.split("/");
                switch ($id[0]) {
                    case 'edit':
                        this.$router.push(`/schedules/${$id[1]}/edit`);
                        break;
                    case 'view':
                        this.$router.push(`/schedules/${$id[1]}/view`);
                        break;
                    case 'delete':
                        this.$Modal.confirm({
                            title: 'Confirm',
                            content: '<p>Are you sure?</p>',
                            onOk: () => {
                                VueUtil(this).select('Schedules').delete($id[1]);
                            }
                        });
                        break;
                }
            }
        }
    }
</script>