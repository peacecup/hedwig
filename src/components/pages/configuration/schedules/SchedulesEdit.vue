<template>
    <div class="schedules-edit" v-pageKey="{key:'schedule.read',ignore: allowView}">
        <Row>
            <Spin fix size="large" v-if="Schedules.preview.loading">
            </Spin>
            <Col span="19">
            <div :class="`layers ${!isEdit?'hidden':''}`">
                <Alert v-if="revert_schedule !== null">
                    You are reverting this schedule to its configuration as it stood between {{moment(revert_schedule.active_from).format($t('date.dateTimeFull')) }} and {{moment(revert_schedule.active_to).format($t('date.dateTimeFull')) }}. Overrides will not be reverted.
                </Alert>
                <Row>
                    <Col span="24" v-for="(layer,_layerIndex) in schedule.schedule_layers" :key="layer.name">
                    <Card>
                        <p slot="title" style="position: relative;">
                            {{layer.name}}
                                <span @click="removeLayer(layer,_layerIndex)">
                                <Icon type="close" class="close"></Icon>
                                </span>
                        </p>
                        <div class="body" style="min-height: 130px">
                            <Alert type="warning" v-if="layer.end !== null">
                                This schedule layer ends on {{moment(layer.end).format('YYYY-MM-DD [at] HH:mm A') }}.
                                <a href="javascript:void(0)" @click="editSetLayerEnd(layer,_layerIndex)"> Edit</a>
                                <a style="position: absolute;right: 20px;" href="javascript:void(0)"
                                   @click="undoSetLayerEnd(layer,_layerIndex)">Undo</a>
                            </Alert>
                            <Steps>
                                <Step title="Step 1" content="Add users"></Step>
                                <Step title="Step 2" content="Set up an on-call rotation"></Step>
                                <Step title="Step 3" content="Changes should take effect at"></Step>
                            </Steps>
                            <Row style="height: 100%">
                                <Col span="8" style="padding-right: 20px;">
                                <div class="select-users">
                                    <div :style="`background:${user.color};`" class="user" v-if="user && user.name"
                                         v-for="(user,index) in layer.users" :key="`${user.id}_${index}`"
                                         v-dragging="{ item: user, list: layer.users ,group:layer.name}">
                                        <div>
                                            <Icon type="arrow-move"></Icon>
                                            <span>{{user.name}}</span>
                                            <span @click="removeSelectUser(layer, user, index)">
                                                <Icon class="close" type="close"></Icon>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Select :clearable="true" :filterable="true" size="small" :ref="layer.name+'_select'"
                                        @on-change="selectUser(layer)">
                                    <Option v-for="user in Users.all.data.list" :value="user.id" :label="user.name"
                                            :key="user.id">
                                        {{user.name}}



                                    </Option>
                                </Select>

                                </Col>
                                <Col span="8" style="padding-right: 20px;">
                                <div class="step2">
                                    <Row>
                                        <Col span="10">
                                        Rotation type</Col>
                                        <Col span="14">
                                        <Select size="small"
                                                v-model="layer.rotationType">
                                            <Option value="daily">daily</Option>
                                            <Option value="weekly">weekly</Option>
                                            <Option value="custom">custom...</Option>
                                        </Select>
                                        </Col>
                                    </Row>
                                    <Row v-if="layer.rotationType === 'custom'">
                                        <Col span="10">
                                        Shift length</Col>
                                        <Col span="14">
                                        <Row>
                                            <Col span="10">
                                            <InputNumber size="small" :min="1"
                                                         v-model="layer.shiftLength"></InputNumber>
                                            </Col>
                                            <Col span="12" offset="2">
                                            <Select size="small" v-model="layer.shiftUnit">
                                                <Option value="h">hours</Option>
                                                <Option value="d">days</Option>
                                                <Option value="w">weeks</Option>
                                            </Select>
                                            </Col>
                                        </Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span="10">
                                        Handoff time</Col>
                                        <Col span="14">
                                        <Row>
                                            <Col span="10" v-if="layer.rotationType !== 'daily'">
                                            <Select v-if="layer.rotationType === 'weekly'" size="small"
                                                    v-model="layer.handoffWeekDay">
                                                <Option :value="weekday.value" :key="weekday.value"
                                                        v-for="weekday in weeks">{{weekday.label}}
                                                </Option>
                                            </Select>
                                            <DatePicker v-else-if="layer.rotationType === 'custom'" size="small"
                                                        :clearable="false"
                                                        v-model="layer.handoffDay"></DatePicker>
                                            </Col>
                                            <Col span="12" :offset="layer.rotationType !== 'daily' ?2:0">
                                            <TimePicker :steps="[1, 30]" :clearable="false" v-model="layer.handoffTime" size="small"
                                                        type="time"
                                                        format="HH:mm"></TimePicker>
                                            </Col>
                                        </Row>
                                        </Col>
                                    </Row>
                                    <div class="divider"></div>
                                    <Row>
                                        <Col>
                                        <Checkbox
                                                @on-change="openRestrictModal(_layerIndex,layer.restrictInfo.restrictCall)"
                                                v-model="layer.restrictInfo.restrictCall"
                                                :value="1">Restrict on-call shifts to specific times <Tooltip content="">
                                                <Icon type="help"></Icon>
                                                <div slot="content">
                                                    <p>Limits on-call duty to specific hours in </p>
                                                    <p> the day or week. (ex: Mon, Wed, Fri </p>
                                                    <p>from midnight to 8am)</p>
                                                </div>
                                            </Tooltip>
                                        </Checkbox>
                                        <p v-if="layer.restrictInfo.restrictCall">
                                        <ul>
                                            <li v-if="layer.restrictInfo.restrictType === 'daily_restriction'"
                                                v-for="(restrict,index) in layer.restrictInfo.restrictions.daily_restrictions">
                                                <strong><span
                                                        v-if="index !== 0">and </span>from {{formatHHmm(restrict.from)}} to {{formatHHmm(restrict.to)}}</strong>
                                            </li>
                                            <li v-if="layer.restrictInfo.restrictType === 'weekly_restriction'"
                                                v-for="(restrict,index) in layer.restrictInfo.restrictions.weekly_restrictions">
                                                <strong>
                                                    <span
                                                            v-if="index !== 0">and </span>from {{numToWeek(restrict.start_day_of_week)}} {{formatHHmm(restrict.from)}} to {{numToWeek(restrict.end_day_of_week)}} {{formatHHmm(restrict.to)}}
                                                </strong></li>
                                        </ul>
                                        <a href="javascript:void(0)"
                                           @click="openRestrictModal(_layerIndex,layer.restrictInfo.restrictCall)">Edit</a>
                                        </p>
                                        </Col>
                                    </Row>
                                </div>

                                </Col>
                                <Col span="8" style="padding-right: 20px;">
                                <Row>
                                    <Col span="10">
                                    <DatePicker :options="options_start" size="small" v-model="layer.start"
                                                :clearable="false"></DatePicker>
                                    </Col>
                                    <Col span="10">
                                    <TimePicker :steps="[1, 30]"  readonly v-model="layer.handoffTime" size="small" format="HH:mm"
                                                type="time"></TimePicker>
                                    </Col>
                                    <Col span="1">
                                    <Tooltip content="">
                                        <Icon type="help"></Icon>
                                        <div slot="content">
                                            <p>Schedule changes take effect at the same </p>
                                            <p>time of day as the rotation handoff time.</p>
                                        </div>
                                    </Tooltip>
                                    </Col>
                                </Row>
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    </Col>
                </Row>
                <Row>
                    <Col span="24">
                    <p>
                        <Button type="primary" icon="plus" @click="addLayer">Add Another Layer</Button>
                    </p>
                    </Col>
                </Row>
            </div>
            <div>
                <Row v-if="!isEdit">
                    <Col span="12">
                    <h2>Schedule: {{schedule.name}}</h2>
                    <div v-if="schedule.description">Description: {{ schedule.description}}</div>
                    </Col>
                    <Col span="12" style="text-align: right">
                    <ButtonGroup>
                        <Button :type="viewModel === 'timeline' ? 'primary': 'default' "
                                @click="changeViewModel('timeline') "
                                icon="navicon">Timeline View


                        </Button>
                        <Button :type="viewModel === 'fullCalendar' ? 'primary': 'default' "
                                @click="changeViewModel('fullCalendar') " icon="calendar">Calendar View


                        </Button>
                    </ButtonGroup>
                    </Col>
                </Row>
                <Card v-if="viewModel === 'timeline'">
                    <SchedulesTimeline :onlyFinal="false"
                                       :permission="allowEdit"
                                       :scheduleOverride="scheduleOverride"
                                       :changeScopeCb="changeScope"
                                       :loading="Schedules.preview.loading"
                                       :schedule="preview"></SchedulesTimeline>
                </Card>
                <Card v-if="viewModel === 'fullCalendar'">
                    <SchedulesFullCalendar :onlyFinal="false"
                                           :permission="allowEdit"
                                           :scheduleOverride="scheduleOverride"
                                           :changeScopeCb="changeScope"
                                           :loading="Schedules.preview.loading"
                                           :schedule="preview"></SchedulesFullCalendar>
                </Card>
            </div>
            </Col>
            <Col span="5">
            <div>
                <Row class="right-area" v-if="revert_schedule !== null">
                    <Col span="24"><Button icon="checkmark" type="success" @click="saveSchedules">Revert Schedule</Button></Col>
                    <Col span="24"><Button icon="trash-a" @click="cancelRevert">Cancel Revert</Button></Col>
                </Row>
                <Row v-else class="right-area" >
                    <Col span="24" v-if="!isEdit">
                    <Button @click="showScheduleInfomation" icon="information-circled">Schedule Info</Button>
                    </Col>
                    <Col  v-key="{key:['schedule.edit'],ignore:allowEdit}" span="24" v-if="!isEdit">
                    <Button icon="edit" @click="editSchedules">Edit this Schedule</Button>
                    </Col>
                    <Col v-key="{key:['schedule.copy'],ignore:allowEdit}" span="24" v-if="!isEdit">
                    <Button icon="ios-copy-outline" @click="copySchedules">Copy this Schedule</Button>
                    </Col>
                    <Col v-key="{key:['schedule.revert'],ignore:allowEdit}" span="24" v-if="!isEdit && Schedules.snapshots_list.data.list && Schedules.snapshots_list.data.list.length > 0">

                    <Dropdown style="width:100%;" @on-click="revert" @on-visible-change="loadRevertList">
                        <Button icon="reply">Revert this Schedule</Button>
                        <DropdownMenu slot="list" style="max-height: 400px;overflow-y:auto;">
                            <DropdownItem :name="snapshot" :key="snapshot.id" v-for=" snapshot in Schedules.snapshots_list.data.list">
                                <Row>
                                    <Col span="24"><strong>{{ snapshot.summary}}</strong></Col>
                                    <Col span="24">Created {{ moment(snapshot.created_at).format($t('date.dateTimeFull'))}}</Col>
                                    <Col span="24">Active from {{ moment(snapshot.active_from).format($t('date.MDTime')) }} to {{ moment(snapshot.active_to).format($t('date.MDTime')) }} </Col>
                                </Row>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>


                    </Col>
                    <Col v-key="{key:['schedule.delete'],ignore:allowEdit}" span="24" v-if="!isEdit">
                    <Button icon="close" :loading="Schedules.delete.loading" @click="deleteSchedules">
                        Delete this Schedule


                    </Button>
                    </Col>
                    <Col span="24" v-key="{key:['schedule.edit'],ignore:allowEdit}" v-if="isEdit">
                    <Button type="success"
                            :disabled="!schedule.schedule_layers || schedule.schedule_layers.length === 0"
                            :loading="Schedules.update.loading || Schedules.save.loading"
                            icon="ios-checkmark" @click="saveSchedules">Save Changes


                    </Button>
                    </Col>
                    <Col span="24" v-if="isEdit">
                    <Button icon="trash-a" @click="discardSchedules"
                            :disabled="Schedules.update.loading || Schedules.save.loading">Discard all Changes


                    </Button>
                    </Col>
                    <Col v-key="{key:`schedule.override`,ignore:allowEdit}" span="24">
                    <Button @click="modal.override = true" icon="calendar"
                            :disabled="!schedule.id || Schedules.update.loading || Schedules.save.loading">
                        Schedule an Override


                    </Button>
                    </Col>
                </Row>
                <Row v-if="isEdit">
                    <Col span="24">
                    <Card style="background: #f8f8f9">
                        <p slot="title">Schedule Info</p>
                        <div class="form">
                            <Form>
                                <Form-item label="Name">
                                    <Input v-model="schedule.name" placeholder="New Schedule..." :maxlength="20"
                                           icon="edit"></Input>
                                </Form-item>
                                <Form-item label="description">
                                    <Input size="small" type="textarea" v-model="schedule.description"
                                           :maxlength="100"></Input>
                                </Form-item>
                                <Form-item label="Time zone">
                                    <Select v-model="schedule.time_zone" filterable clearable>
                                        <TimeZoneSelect></TimeZoneSelect>
                                    </Select>
                                </Form-item>
                            </Form>
                        </div>
                    </Card>
                    </Col>
                </Row>
                <Row v-key="{key:`schedule.upcoming_override`,ignore:allowEdit}" v-if="override_list && override_list.length > 0">
                    <Col span="24">
                    <Card>
                        <p slot="title">
                            Upcoming Overrides
                        </p>
                        <div v-if="schedule.id">
                            <div v-for="override in override_list">
                                <div :style="`background:${override.user.color};`" class="user-item"
                                     v-if="override.user.summary"
                                >
                                    <div>
                                        <span>{{override.user.summary}}</span>
                                        <span v-key="{key:`schedule.delete_override`,ignore:allowEdit}" @click="deleteOverride(override.id)">
                                                    <Icon class="close" type="close"></Icon>
                                                </span>
                                    </div>
                                </div>
                                <div>
                                    {{moment(override.start).format($t('date.MDTime'))}}~ {{moment(override.end).format($t('date.MDTime'))}}






                                </div>
                            </div>
                        </div>
                    </Card>
                    </Col>
                </Row>
                <Row>
                    <Col span="24">
                    <Card>
                        <p slot="title">
                            Escalation Policies
                        </p>
                        <div v-if="!policies || policies.length === 0">
                            No escalation policies are using this schedule.




                        </div>
                        <div v-else>
                            <div class="top-bottom-5" v-for="es in policies">
                                <Icon type="alert-circled"></Icon>
                                <permission-router-link :target="es" type="policy">{{es.summary}}</permission-router-link>
                            </div>
                        </div>
                    </Card>
                    </Col>
                </Row>
                <Row>
                    <Col span="24">
                    <Card>
                        <p slot="title">
                            Teams
                        </p>
                        <div v-if="!teams || teams.length === 0">
                            No teams are using this schedule.




                        </div>
                        <div v-else>
                            <div class="top-bottom-5" v-for="team in teams">
                                <Icon type="ios-people"></Icon>
                                <router-link :to="`/teams/${team.id}/detail`">{{team.summary}}</router-link>
                            </div>
                        </div>
                    </Card>
                    </Col>
                </Row>


                <Row>
                    <Col span="24">
                    <Card class="users">
                        <p slot="title">
                            Users
                        </p>
                        <div class="content">
                            <div v-for="user in layer_users">
                                <div style="display: flex;margin-bottom: 3px;">
                                    <div :style="`flex: 0 0 auto;background:${user.color};width:22px;height:22px;`"></div>
                                    <div style="margin-left: 10px;flex: 1 0 auto;">
                                        <router-link :to="`/users/${user.id}`">{{user.summary || user.name}}


                                        </router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    </Col>
                </Row>
            </div>
            </Col>
        </Row>
        <SchedulesOverride :override="override" :schedule="schedule" v-model="modal.override"></SchedulesOverride>

        <Modal width="600px" v-model="modal.restriction" :mask-closable="false" title="Restriction">
            <ScheduleRestrictionEdit :modal="modal.restriction" ref="ScheduleRestrictionEditFrom" v-if="layerIndex > -1"
                                     v-model="schedule.schedule_layers[layerIndex].restrictInfo"></ScheduleRestrictionEdit>
            <div slot="footer">
                <Button size="large" @click="modal.restriction = false">{{ $t('button.cancel')}}</Button>
                <Button type="primary" size="large" :loading="loading" @click="applyRestriction">Apply</Button>
            </div>
        </Modal>
        <Modal width="600px" v-model="modal.removeLayer" :mask-closable="false" title="Schedule Layer Removal">
            <p>
                Choose a date and time for this layer to end (to preserve historical accuracy, schedule layers aren't deleted).</p>

            <p><strong>Schedule Layer End Time</strong></p>
            <Row v-if="layerIndex > -1">
                <Col span="10">
                <DatePicker type="datetime" size="small" format="yyyy-MM-dd HH:mm"
                            v-model="schedule.schedule_layers[layerIndex]._end"></DatePicker>
                </Col>
            </Row>
            <div slot="footer">
                <Button size="large" @click="modal.removeLayer = false">{{ $t('button.cancel')}}</Button>
                <Button type="primary" size="large" :loading="loading" @click="setLayerEnd">Remove Layer</Button>
            </div>
        </Modal>
        <Modal width="800px" v-model="modal.info" title="Schedule Info">
            <ScheduleInfomation :schedule="schedule"></ScheduleInfomation>
            <div slot="footer">
                <Button size="large" @click="modal.info = false">{{ $t('button.cancel')}}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import _ from 'lodash';
    import SchedulesTimeline from './SchedulesTimeline.vue';
    import SchedulesFullCalendar from './SchedulesFullCalendar.vue';
    import ScheduleInfomation from './ScheduleInfomation.vue';
    import SchedulesOverride from './SchedulesOverride.vue';
    import ScheduleRestrictionEdit from './ScheduleRestrictionEdit.vue';
    import {VueUtil, FormUtil, ScheduleUtil, PermissionUtil} from '@util';
    import moment from 'moment';
    import Vue from 'vue';
    const SCHEDULE = {
        name: null,
        description: "",
        time_zone: Vue.config.timezone,
        team: [],
        schedule_layers: [],
        _id: null,
    };
    export default{
        name: 'SchedulesEdit',
        components: {
            SchedulesTimeline,
            SchedulesOverride,
            ScheduleRestrictionEdit,
            ScheduleInfomation,
            SchedulesFullCalendar
        },
        computed: {
            ...VueUtil(this).select(['Users', 'Teams', 'Schedules', 'EscalationPolicies']).state(),
            ...VueUtil(this).select(['Schedules']).getters(),
            allowEdit(){
                return PermissionUtil.schedule.allowEdit({id: this.$route.params.id});
            },
            allowView(){
               return PermissionUtil.schedule.allowView({id: this.$route.params.id});
            }
        },
        data(){
            const weeks = this.getWeek();
            return {
                options_start: {
                    disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
                },
                viewModel: 'timeline',
                preview_lock: false,
                modal: {
                    restriction: false,
                    removeLayer: false,
                    override: false,
                    info: false,
                },
                override_list: [],
                teams: [],
                policies: [],
                layerIndex: -1,
                schedule: SCHEDULE,
                layer_users: [],
                isEdit: false,
                override: {},
                loading: false,
                weeks: weeks,
                preview: {},
                revert_schedule: null,
                params: {
                    since: null,
                    until: null,
                }
            }
        },
        mounted(){

            if (this.$route.name === 'Schedule Details') {
                this.setIsEdit(false);
            } else if (this.$route.name === 'Edit Schedule') {
                this.setIsEdit(true);
            } else {
                this.schedule = {
                    ... _.cloneDeep(SCHEDULE),
                    name: this.getNextScheduleName(),
                };
                this.addLayer();
                this.setIsEdit(true);
            }
            VueUtil(this).select("Users").action('all');
            if (this.$route.params.id) {
                this.get();
            }
        },
        destroyed(){
          VueUtil(this).select('Schedules').clear(['get','override_list']).select('EscalationPolicies').clear(['listBySchedule']);
        },
        watch: {
            'schedule.schedule_layers': {
                handler: "listenTempSchedules",
                deep: true
            },
            "params": {
                handler: "listenScope",
                deep: true,
            },
            "EscalationPolicies.listBySchedule": "listenEscalationPolicies",
            "Schedules.get": "listenSchedules",
            "Schedules.save": "listenSchedules",
            "Schedules.update": "listenSchedules",
            "Schedules.delete": "listenSchedules",
            "Schedules.preview": "listenSchedules",
            "Schedules.override_save": "listenSchedulesOverride",
            "Schedules.override_delete": "listenSchedulesOverride",
            "Schedules.override_list": "listenSchedulesOverride",
            "Schedules.snapshots_get": "listenSchedulesSnapshots",
        },
        methods: {
            ...VueUtil(this).select(['Users', 'Teams', 'Schedules', 'EscalationPolicies']).actions(),
            loadRevertList(visible){
              if(visible) {
                  VueUtil(this)
                      .select("Schedules")
                      .action('snapshots_list',{scheduleId: this.$route.params.id,limit:10,offset:1})
              }
            },
            setIsEdit(isEdit){
                this.isEdit = isEdit;
                if (isEdit) {
                    this.viewModel = 'timeline';
                }
            },
            changeViewModel(model) {
                this.viewModel = model;
            },
            applyRestriction(){
                this.$refs['ScheduleRestrictionEditFrom'].applyRestriction();
                this.modal.restriction = false;
            },
            cancelRevert(){
               this.setIsEdit(false);
                this.revert_schedule = null;
                this.schedule = _.cloneDeep(SCHEDULE);
                this.get();
            },
            revert(snapshot){
                VueUtil(this).select('Schedules').action('snapshots_get',{
                    scheduleId: this.schedule.id,
                    snapshotId: snapshot.id,
                    include:['schedule_layers'],
                });
            },
            listenSchedulesSnapshots(data){
              VueUtil(this).cb(data).success(() => {
                if(data.type === 'snapshots_get') {
                    this.revert_schedule = data.data;
                    this.schedule.schedule_layers = [];
                   this.setIsEdit(true);
                    setTimeout(()=> {
                        this.schedule.schedule_layers = _.map(data.data.schedule_layers, this.boToLayer);
                    },300)

                }
              }).error();
            },

            get(){
                let params = {
                    id: this.$route.params.id,
                    time_zone: Vue.config.timezone,
                    since: ScheduleUtil.momentToString(moment().add(-1, 'd')),
                    until: ScheduleUtil.momentToString(moment().add(30, 'd')),
                };
                VueUtil(this)
                    .select("Schedules")
                    .get(params)
                    .action('override_list', {...params, editable: true})
                    .select('EscalationPolicies').action('listBySchedule', {
                        schedulesId: params.id,
                        include: ["teams"],
                    });
                this.loadRevertList(true);
            },
            setLayerEnd(){
                if (this.schedule.schedule_layers[this.layerIndex]._end === '') {
                    this.$Message.warning('please input end time!');
                    return;
                }
                this.schedule.schedule_layers[this.layerIndex].end = this.schedule.schedule_layers[this.layerIndex]._end;
                this.modal.removeLayer = false;
            },
            changeScope({start, end}){
                if (start)
                    this.params.since = ScheduleUtil.momentToString(moment(start));
                if (end)
                    this.params.until = ScheduleUtil.momentToString(moment(end));
            },
            listenEscalationPolicies(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'listBySchedule') {

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
                        this.policies = data.data.list;
                        this.teams = teams;
                    }
                }).error();
            },
            listenScope(params){
                this.listenTempSchedules(this.schedule);
            },
            listenTempSchedules(schedule){
                schedule = this.schedule;
                if (schedule && schedule.schedule_layers && schedule.schedule_layers.length > 0) {
                    if (this.params.since && this.params.until) {
                        VueUtil(this).select('Schedules').action('preview', {
                            ...this.schedulesToBo(schedule),
                            params: this.params,
                        });
                    }
                }
                this.override_list = this.filterOverride(_.get(this.Schedules, 'override_list.data.list', []));
            },
            schedulesToBo(schedule){
                if (!schedule)
                    return;
                var schedule = _.cloneDeep(schedule);
                this.layer_users = [];
                schedule.schedule_layers = _.chain(schedule.schedule_layers).filter(layer => layer.users && layer.users.length > 0).map(this.layerToBo).value();
                return schedule;
            },
            addLayer(){
                this.schedule.schedule_layers.push({
                    name: `Layer ${this.schedule.schedule_layers.length + 1}`,
                    _id: VueUtil(this).guid(),
                    rotationType: "weekly",
                    shiftLength: 1,
                    shiftUnit: 'w',
                    handoffWeekDay: 1,
                    restrictInfo: {
                        restrictCall: false,
                        restrictType: 'daily_restriction',
                        restrictions: this.getDefaultRestriction(),
                    },
                    handoffDay: moment(),
                    handoffTime: '15:00',
                    start: moment(),
                    end: null,
                    users: [],

                })
            },
            getDefaultRestriction(){
                return {
                    daily_restrictions: [],
                    weekly_restrictions: [],
                }
            },
            editSetLayerEnd({name, id, _id}, index){
                this.layerIndex = index;
                this.modal.removeLayer = true;
            },
            undoSetLayerEnd({name, id, _id}, index){
                this.schedule.schedule_layers[index].end = null;
            },
            removeLayer({name, id, _id}, index){
                if (id) {
                    this.layerIndex = index;
                    this.modal.removeLayer = true;
                } else {
                    this.schedule.schedule_layers = _.chain(this.schedule.schedule_layers).filter(l => {
                        return l._id !== _id;
                    }).map((layer, index) => {
                        layer.name = `Layer ${index + 1}`;
                        return layer;
                    }).value();
                    this.layerIndex = -1;
                }

            },

            openRestrictModal(layerIndex, restrictCall){
                if (restrictCall === true) {
                    this.layerIndex = layerIndex;
                    this.modal.restriction = true;
                } else {
                    this.layerIndex = -1;
                    this.modal.restriction = false;
                }
            },

            numToWeek(num){
                if (num) {
                    num = num * 1;
                    const week = this.getWeek();
                    return _.filter(week, w => w.value === num)[0].label;
                } else {
                    return '';
                }
            },
            getWeek(){

                return ScheduleUtil.getWeek();
            },
            scheduleOverride(data){
                this.modal.override = true;
                data.scheduleId = this.schedule.id;
                data.time_zone = Vue.config.timezone;
                this.override = _.cloneDeep(data);
            },
            deleteOverride(id){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select("Schedules").action('override_delete', {
                            scheduleId: this.schedule.id,
                            id: id,
                        });
                    }
                });

            },

            listenSchedulesOverride(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'override_save') {
                        this.modal.override = false;
                        this.loading = false;
                        this.$Message.success("save success!");
                        this.get();
                        this.listenTempSchedules(this.schedule);
                    } else if (data.type === 'override_delete') {
                        this.$Message.success("delete success!");
                        this.get();
                        this.listenTempSchedules(this.schedule);
                    } else if (data.type === 'override_list') {
                        this.override_list = this.filterOverride(data.data.list);
                        this.initUsers(_.map(this.override_list, o => o.user));
                    }
                }).error();
            },

            filterOverride (override_list) {
                return _.filter(override_list, override => {
                    if (moment(override.end).isBefore(moment(this.params.since)) || moment(override.start).isAfter(moment(this.params.until))) {
                        return false;
                    } else {
                        return true;
                    }
                });
            },

            boToSchedule(data){
                let schedule = {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    team: data.team,
                    time_zone: data.time_zone,
                    schedule_layers: _.map(data.schedule_layers, this.boToLayer),
                };
                return schedule;
            },
            //后台数据转换前台数据
            boToLayer({id, name, start, end, rendered_coverage_percentage, rendered_schedule_entries, restrictions = [], rotation_turn_length_seconds, rotation_virtual_start, users}){
                let layer = {
                    id, name, start, end, rotation_virtual_start, _end: end === null ? moment() : end,
                };
                if (users) {
                    layer.users = _.map(users, (user, index) => {
                        return {
                            id: user.id,
                            name: user.summary,
                            color: user.color,
                        }
                    })
                }
                //根据步长计算循环类型
                let hours = rotation_turn_length_seconds / 3600;
                if (hours < 24) {
                    layer.rotationType = 'custom';
                    layer.shiftLength = hours;
                    layer.shiftUnit = 'h';
                } else if (hours === 24) {
                    layer.rotationType = 'daily';
                    layer.shiftLength = 1;
                    layer.shiftUnit = 'd';
                } else if (hours === 24 * 7) {
                    layer.shiftLength = 1;
                    layer.rotationType = 'weekly';
                    layer.shiftUnit = 'w';
                    layer.handoffWeekDay = moment(layer.rotation_virtual_start).weekday();

                } else if (hours > 24 && hours < 24 * 7 || hours % ( 24 * 7) !== 0) {
                    layer.rotationType = 'custom';
                    layer.shiftLength = hours / 24;
                    layer.shiftUnit = 'd';
                }
                layer.handoffTime = moment(layer.rotation_virtual_start).format('HH:mm');
                layer.handoffDay = moment(layer.rotation_virtual_start).format('YYYY-MM-DD');
                restrictions = _.filter(restrictions, r => r !== null && !_.isUndefined(r));
                //计算约束
                if (restrictions && restrictions.length > 0) {
                    layer.restrictInfo = {};
                    layer.restrictInfo.restrictCall = true;

                    if (restrictions[0].type === 'daily_restriction') {
                        restrictions = _.map(restrictions, r => {
                            let time = ScheduleUtil.momentToUTC(moment(`2000-01-01 ${r.start_time_of_day}`));
                            r.from = r.start_time_of_day;
                            r.to = moment(time).add(r.duration_seconds, 's').format('HH:mm');
                            return r;
                        })

                        layer.restrictInfo.restrictions = {
                            daily_restrictions: restrictions,
                        }
                        layer.restrictInfo.restrictType = 'daily_restriction';
                    } else { //计算周约束
                        restrictions = _.map(restrictions, r => {
                            let now = moment((moment().format('YYYY-MM-DD') + " " + r.start_time_of_day));
                            let nowWeek = now.format('e') * 1;
                            let offset = nowWeek - (r.start_day_of_week === '7' ? 0 : r.start_day_of_week ) * 1; //计算星期数偏差值
                            let start = now.add(offset * -1, 'd');
                            let end = start.add(r.duration_seconds, 's');
                            r.start_day_of_week = r.start_day_of_week * 1;
                            r.end_day_of_week = end.format("e") * 1;
                            r.end_day_of_week = r.end_day_of_week === 0 ? 7 : r.end_day_of_week;
                            r.from = r.start_time_of_day;
                            r.to = end.format("HH:mm");
                            return r;
                        });
                        layer.restrictInfo.restrictions = {
                            weekly_restrictions: restrictions,
                        }
                        layer.restrictInfo.restrictType = 'weekly_restriction';
                    }
                } else { //没有约束则设定默认值
                    layer.restrictInfo = {
                        restrictCall: false,
                        restrictions: this.getDefaultRestriction()
                    }
                }
                this.initUsers(users);
                return layer;
            },
            //计算右下方 users 列表(去重算法)
            initUsers(users){
                this.layer_users = _.uniqBy(_.concat(users, this.layer_users), user => {
                    return user.id;
                });
            },

            listenSchedules(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'get') {
                        if (this.$route.params.id !== data.data.id) {
                            return;
                        }
                        if (_.isObject(data.data)) {
                            if (!this.schedule.id && !this.schedule.name) { //初始化页面数据
                                this.schedule = this.boToSchedule(data.data);
                            } else if (!this.schedule.id) { //新增保存后回写 id
                                this.schedule.id = data.data.id;
                            }

                        } else {
                            this.$Message.error(`no data!`);
                            setTimeout(() => {
                                this.$router.push("/schedules");
                            }, 1300);
                        }
                        return;
                    } else if (data.type === 'delete') {
                        setTimeout(() => {
                            this.$router.push("/schedules");
                        }, 1300);
                    } else if (data.type === 'save') {
                        this.$Message.success(`create schedule success!`);
                        this.writeBackId(data.data);
                        this.$router.push(`/schedules/${data.data.id}/view`);
                        this.setIsEdit(false);
                        return;
                    } else if (data.type === 'update') {
                        this.writeBackId(data.data);
                        this.revert_schedule = null;
                        this.loadRevertList(true);
                       this.setIsEdit(false);
                    } else if (data.type === 'preview') {
                        this.preview = data.data;
                        this.preview_lock = false;
                        return;
                    }
                    this.$Message.success(`${data.type} success!`);


                }).error();
            },
            writeBackId({id, schedule_layers}){
                _.forEach(this.schedule.schedule_layers, (layer, index) => {
                    layer.id = schedule_layers[index].id;
                    layer.start = schedule_layers[index].start;
                });
                this.schedule.id = id;
            },

            //当页面变动时 封装数据给 schedulesTimeline
            scheduleToEvents(){
                return ScheduleUtil.scheduleToEvents(this.schedule);
            },
            selectUser(layer){
                let select = this.$refs[layer.name + "_select"][0];
                let id = select.model;
                const user = _.find(this.Users.all.data.list, {id: id});
                if (!_.isUndefined(user)) {
                    layer.users.push({
                        ...user,
                        sort: layer.users.length + 1,
                    });
                    this.schedule.schedule_layers = _.map(this.schedule.schedule_layers, l => {
                        if (l.name === layer.name) {
                            return layer;
                        } else
                            return l;
                    })
                }

                select.model = null;
            },
            formatHHmm(time){
                if (_.isString(time)) {
                    return time.substring(0, 5);
                } else {
                    return moment(time).format('HH:mm');
                }
            },
            removeSelectUser(layer, {id, sort}, index){
                layer.users = _.remove(layer.users, (u, _index) => index !== _index);
                this.schedule.schedule_layers = _.map(this.schedule.schedule_layers, l => {
                    if (l.name === layer.name) {
                        return layer;
                    } else
                        return l;
                })

            },
            saveSchedules(){
                let error = '';
                if (this.schedule.name === '') {
                    error = "name is not null!";
                }

                if (error !== '') {
                    this.$Message.error(error);
                    return;
                }

                if (this.schedule.id) {
                    VueUtil(this).select("Schedules").update(this.schedule, this.beforeSave);
                } else {
                    VueUtil(this).select("Schedules").save(this.schedule, this.beforeSave);
                }
            },
            beforeSave(_pd){
                let pd = _.cloneDeep(_pd);
                pd.schedule_layers = _.map(pd.schedule_layers, (layer, index) => {
                    layer.name = `Layer ${index + 1}`;
                    return this.layerToBo(layer);
                })
                if (pd.team && pd.team.length > 0) {
                    pd.team = _.map(pd.team, team => {
                        return {
                            id: team,
                        }
                    });
                } else {
                    pd.team = null;
                }

                return pd;
            },
            //页面 layer 数据转换成提交数据
            layerToBo(layer){
                let rotation_turn_length_seconds = 0;
                let rotation_virtual_start = moment(moment(layer.handoffDay).format("YYYY-MM-DD") + " " + (layer.handoffTime.length === 5 ? layer.handoffTime : moment(layer.handoffTime).format("HH:mm")));
                let start = moment(moment(layer.start).format('YYYY-MM-DD') + " " + (_.isString(layer.handoffTime) ? layer.handoffTime : moment(layer.handoffTime).format('HH:mm')));
                if (layer.rotationType === 'daily') {
                    rotation_turn_length_seconds = ScheduleUtil.getSecondByUnit('d');
                    rotation_virtual_start = start;
                } else if (layer.rotationType === 'weekly') {
                    rotation_turn_length_seconds = ScheduleUtil.getSecondByUnit('w');
                    rotation_virtual_start = moment(moment().day(layer.handoffWeekDay).format("YYYY-MM-DD") + " " + (layer.handoffTime.length === 5 ? layer.handoffTime : moment(layer.handoffTime || "00:00").format("HH:mm")));
                } else {
                    rotation_turn_length_seconds = layer.shiftLength * ScheduleUtil.getSecondByUnit(layer.shiftUnit);
                }
                let restrictions;
                if (layer.restrictInfo.restrictType) {
                    restrictions = _.filter(layer.restrictInfo.restrictions[layer.restrictInfo.restrictType + 's'], restrict => restrict !== null);
                    if (layer.restrictInfo.restrictions.length === 0) {
                        restrictions = null;
                    }
                }
                this.initUsers(layer.users);
                this.initUsers(_.map(this.override_list, o => o.user));

                return {
                    start: ScheduleUtil.momentToString(start),
                    end: layer.end === null ? null : ScheduleUtil.momentToString(moment(layer.end)),
                    id: layer.id,
                    name: layer.name,
                    rotation_virtual_start: ScheduleUtil.momentToString(rotation_virtual_start),
                    rotation_turn_length_seconds,
                    users: _.chain(layer.users).filter(user => !!user.id).map(user => {
                        return {
                            id: user.id,
                        }
                    }).value(),
                    restrictions: this.restrictToBo(restrictions, layer.restrictInfo.restrictCall),
                }
            },
            HHmmToSecond(time){
                if (_.isString(time)) {
                    let times = time.split(":");
                    return times[0] * 3600 + times[1] * 60;
                } else {
                    return this.HHmmToSecond(moment(time).format("HH:mm"));
                }
            },
            restrictToBo(restrictions, restrictCall){

                if (restrictCall && restrictions !== null) {
                    return _.chain(restrictions).filter(r => !_.isUndefined(r)).map(r => {
                        let duration_seconds = 0;
                        if (r.end_day_of_week && r.start_day_of_week) {
                            let end = r.end_day_of_week === 7 ? 0 : r.end_day_of_week;
                            let start = r.start_day_of_week === 7 ? 0 : r.start_day_of_week;
                            duration_seconds = (end - start );
                            if (duration_seconds < 0) {
                                duration_seconds += 7;
                            }
                            duration_seconds = duration_seconds * ScheduleUtil.getSecondByUnit('d') + this.HHmmToSecond(r.to) - this.HHmmToSecond(r.from);
                        } else {
                            let to, from;
                            if (_.isString(r.to)) {
                                to = moment('2000-01-01 ' + r.to);
                            } else {
                                to = moment('2000-01-01 ' + moment(r.to).format('HH:mm'));
                            }
                            if (_.isString(r.from)) {
                                from = moment('2000-01-01 ' + r.from);
                            } else {
                                from = moment('2000-01-01 ' + moment(r.from).format('HH:mm'));
                            }
                            duration_seconds = moment(to).unix() - moment(from).unix();
                            if(duration_seconds < 0)
                                duration_seconds += 24 * 3600;
                        }
                        if (!duration_seconds || duration_seconds < 0) {
                            return null;
                        }
                        let start_time_of_day = _.isString(r.from) ? r.from : moment(r.from).format("HH:mm") + ":00";
                        if (start_time_of_day.length === 5) {
                            start_time_of_day = start_time_of_day + ":00";
                        }
                        return {
                            type: r.type,
                            start_time_of_day: start_time_of_day,
                            start_day_of_week: r.start_day_of_week,
                            duration_seconds: duration_seconds
                        }
                    }).filter(r => r !== null).sortBy(r => r.start_day_of_week + r.start_time_of_day).value();
                } else {
                    return null;
                }
            },

            deleteSchedules(){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select("Schedules").delete(this.schedule.id);
                    }
                });
            },
            editSchedules(){
                this.setIsEdit(true);
                this.$router.push(`/schedules/${this.$route.params.id}/edit`);
                this.get();
            },
            discardSchedules(){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        if (this.schedule.id) {
                           this.setIsEdit(false);
                            this.schedule = _.cloneDeep(SCHEDULE);
                            this.$router.push(`/schedules/${this.$route.params.id}/view`);
                            this.get();
                        } else {
                            this.$router.push(`/schedules`);
                        }

                    }
                });
            },
            getNextScheduleName(){
                return `Schedule #${_.get(this, 'Schedules.list.data.total', 0) + 1 }`;
            },
            copySchedules(){
                this.schedule.id = null;
                this.preview.overrides_subschedule = null;
                this.policies = [];
                this.teams = [];
                this.schedule.name = this.getNextScheduleName();
                this.setIsEdit(true);
                this.$router.push("/schedules/new");
            },
            showScheduleInfomation(){
                this.modal.info = true;
            }
        }
    }
</script>