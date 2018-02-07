<template>
    <div v-pageKey="'incident.read'">
        <Row v-if="!!Dicts">
            <Col span="20">
            <Row type="flex" style="min-height:35%;">
                <Col span="24">
                <Form :model="incident" onSubmit="return false;">
                    <template v-if="isEdit">
                        <Input icon="edit" maxlength="50" :autofocus="true" ref="title"
                               :maxlength="2048" v-model="incident.title" style="width: 500px"/>
                        <Button v-key="{key:'incident.edit', ignore:assignToMe || respondToMe}" htmlType="submit" @click="updateIncident" icon="android-create"
                                type="success"></Button>
                        <Button v-key="{key:'incident.edit', ignore:assignToMe || respondToMe}" @click="isEdit = false" icon="close"></Button>
                    </template>
                    <template v-else>
                        <span style="font-size:20px;">{{incident.title}}</span>
                        <Button v-key="{key: 'incident.edit', ignore:assignToMe || respondToMe}" style="margin-left: 10px;" icon="edit" size="small"
                                @click="setEdit(true)"></Button>
                    </template>
                </Form>
                </Col>
                <Col span="24">
                <div class="divider"></div>
                </Col>
                <Col span="4" class="text-align-right">
                <strong>{{$t('h.status')}}</strong></Col>
                <Col span="8">
                <span :style="`color:${_.get(Dicts,`incident_status[${incident.status}].color`,'')}`">
                {{ incident.status }}
                </span>
                </Col>
                <Col span="4" class="text-align-right">
                <strong>{{$t('h.urgency')}}</strong></Col>
                <Col span="8">
                {{incident.urgency}}</Col>

                <Col span="4" class="text-align-right">
                <strong>{{$t('h.description')}}</strong></Col>
                <Col span="8">
                <!-- {{incident.body.details}} -->
                </Col>
                <Col span="4" class="text-align-right">
                <strong>{{$t('h.incidentkey')}}</strong></Col>
                <Col span="8">
                {{incident.incident_key}}</Col>

                <Col span="4" class="text-align-right">
                <strong>{{$t('h.incidenttimes')}}</strong></Col>
                <Col span="8">
                {{ moment(incident.created_at).format($t('date.MDTime')) }}</Col>
                <Col span="4" class="text-align-right">
                <strong>{{$t('h.service')}}</strong></Col>
                <Col span="8">
                <permission-router-link :target="incident.service" type="service">{{incident.service.name}}</permission-router-link>
                </Col>

                <Col span="4" offset="12" class="text-align-right">
                <strong>{{$t('h.servicedescription')}}</strong></Col>
                <Col span="8">
                {{incident.service.description}}</Col>
            </Row>
            <Row type="flex" style="min-height: 60%">
                <Col span="24">
                <Tabs :value="currentTab" :animated="false" @on-click="clickTab">
                    <Tab-pane name="Details" :label="I18n('details')">
                        <IncidentAlerts :incidentObj="incident"></IncidentAlerts>
                    </Tab-pane>
                    <Tab-pane name="Response" :label="I18n('response')">
                        <IncidentResponse @openResponder="openResponder" @openReassign="openReassign" :permission="assignToMe || respondToMe" :incident="incident"></IncidentResponse>
                    </Tab-pane>
                    <Tab-pane name="SUBSCRIBERS" :label="I18n('subscribers')">
                        <IncidentsSubScribers :permission="assignToMe || respondToMe" :incident="incident"></IncidentsSubScribers>
                    </Tab-pane>
                    <Tab-pane name="Timeline" :label="I18n('timeline')">
                        <IncidentLogEntries :incident="incident"></IncidentLogEntries>
                    </Tab-pane>
                </Tabs>
                </Col>
            </Row>
            </Col>
            <Col span="4" v-show="!loading">
            <Row>
                <Col span="24">
                <ResponderHandler :incident="incident"></ResponderHandler>
                </Col>
                <Col v-key="{key:'incident.snooze',ignore:assignToMe || respondToMe}" span="24" v-if="incident.status !== 'resolved'">
                <Dropdown placement="bottom-end" @on-click="snooze" class="w-100p">
                    <Button :loading="loading" icon="clock" class="w-100p text-align-left"
                            :disabled="incident.status === 'resolved'">
                        <span>{{ I18n('snooze') }}</span>
                        <Icon type="arrow-down-b"></Icon>
                    </Button>
                    <Dropdown-menu slot="list" v-if="incident.status !== 'resolved'">
                        <Dropdown-item :name="3600">1 {{$t('h.hours')}}</Dropdown-item>
                        <Dropdown-item :name="3600 * 4">4 {{$t('h.hours')}}</Dropdown-item>
                        <Dropdown-item :name="3600 * 8">8 {{$t('h.hours')}}</Dropdown-item>
                        <Dropdown-item :name="3600 * 24">24 {{$t('h.hours')}}</Dropdown-item>
                        <Dropdown-item name="others">{{$t('h.others')}}</Dropdown-item>
                    </Dropdown-menu>
                </Dropdown>
                </Col>
                <Col v-key="{key:'incident.reassign',ignore:assignToMe || respondToMe}" span="24" v-if="incident.status !== 'resolved'">
                <Button icon="navigate" class="w-100p text-align-left" @click="openReassign"
                        :disabled="incident.status === 'resolved'">
                    {{ I18n('reassign') }}




                </Button>
                </Col>
                <Col v-key="{key: `incident.add_responder`,ignore: assignToMe || respondToMe}" span="24" v-if="incident.status !== 'resolved'">
                <Button icon="person-add" class="w-100p text-align-left" @click="openResponder"
                        :disabled="incident.status === 'resolved'">{{ I18n('add responders') }}



                </Button>
                </Col>
                <Col v-key="{key:'incident.merge', ignore:assignToMe || respondToMe}" span="24" v-if="incident.status !== 'resolved'">
                <Button class="w-100p text-align-left" icon="cube" @click="showMergeModal"
                        :disabled="incident.status === 'resolved'">{{I18n('merge incidents')}}



                </Button>
                </Col>
                <Col v-key="{key:'incident.resolve',ignore:assignToMe || respondToMe}" span="24" v-if="incident.status !== 'resolved'">
                <div class="divider top-bottom-10"></div>
                <Button icon="checkmark" :disabled="incident.status === 'resolved'" class="w-100p text-align-left"
                        @click="updateStatus('resolved')">
                    {{I18n('resolve')}}




                </Button>
                <div class="divider top-bottom-10"></div>
                </Col>
                <Col span="24" v-key="{key:`incident.redact`,ignore:assignToMe || respondToMe}">
                <Button type="default" class="w-100p text-align-left" icon="flag" @click="redactIncident">
                    {{ I18n('redact incident') }}
                </Button>
                </Col>
            </Row>


            </Col>
            <IncidentsReAssign v-model="modal.reAssign" :incidents="[incident]"></IncidentsReAssign>
            <IncidentsSnooze v-model="modal.snooze" :incidents="[incident]"></IncidentsSnooze>
            <IncidentsMerge v-model="modal.merge" :incidents="[incident]"></IncidentsMerge>
            <IncidentsResponder v-model="modal.responder" :incidents="[incident]"></IncidentsResponder>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import store from 'store';
    import {VueUtil, FormUtil, Dicts, PermissionUtil} from '@util';
    import IncidentsTools from './IncidentsTools.vue';
    import IncidentsMain from './IncidentsMain.vue';
    import IncidentsReAssign from './IncidentsReAssign.vue';
    import IncidentsResponder from './IncidentsResponder.vue';
    import ResponderHandler from './ResponderHandler.vue';
    import IncidentsSubScribers from './IncidentsSubScribers.vue';
    import IncidentLogEntries from './IncidentLogEntries.vue';
    import IncidentsMerge from './IncidentsMerge.vue';
    import Note from './Note.vue';
    import IncidentAlerts from '../alerts/IncidentAlerts.vue'
    import IncidentsSnooze from './IncidentsSnooze.vue';
    import IncidentResponse from './IncidentResponse.vue';
    export default{
        components: {
            IncidentsTools,
            IncidentsMain,
            Note,
            IncidentsReAssign,
            IncidentsResponder,
            ResponderHandler,
            IncidentsSubScribers,
            IncidentsMerge,
            IncidentsSnooze,
            IncidentAlerts,
            IncidentLogEntries,
            IncidentResponse,
        },
        computed: {
            ...VueUtil(this).select(['Incidents', 'Services', 'Users', 'Alerts']).state(),
            ...VueUtil(this).select(['Incidents']).getters(),
            assignToMe(){
                return  PermissionUtil.incident.assignToMe(this.Incidents.get.data);
            },
            respondToMe(){
                return  PermissionUtil.incident.respondToMe(this.Incidents.get.data);
            }
        },
        destroyed(){
            VueUtil(this).select('Incidents').clear('get');
        },
        methods: {
            ...VueUtil(this).select(['Incidents', 'Services', 'Users', 'Alerts']).actions(),
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            newService(){
                this.$router.push("/service/add");
            },
            setEdit(f){
                this.isEdit = f;
            },
            openModal(){
                this.$refs['incidentsMain'].openModal();
            },
            getService(id){
                VueUtil(this).select("Services").get(id);
            },
            showMergeModal(){
                this.modal.merge = true;
            },
            listenServices(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'get') {
                        this.incident.service = data.data;
                    }
                }).error();
            },
            listenIncidents(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'get') {
                        this.incident = data.data;
                        this.getService(this.incident.service.id);
                        this.loading = false;
                    } else if (data.type === 'update') {
                        this.isEdit = false;
                        this.$Message.success('update success!');
                    } else if (data.type === 'manage') {
                        this.getIncident();
                        this.$Message.success('manage success!');
                    } else if (data.type === 'redact') {
                        this.getIncident();
                        this.$Message.success('redact success!');
                    } else if (data.type === 'reassign') {
                        this.getIncident();
                        this.$Message.success('reassign success!');
                    } else if (data.type === 'responder') {
                        this.getIncident();
                        this.$Message.success('responder success!');
                    } else if (data.type === 'merge') {
                        this.getIncident();
                        this.$Message.success('merge success!');
                    }
                }).error();
            },
            updateIncident(){
                if (this.incident.title.length === 0) {
                    this.$Message.error('title is not empty!');
                } else if (this.Incidents.update.loading === false) {
                    VueUtil(this).select('Incidents').update({
                        id: this.incident.id,
                        title: this.incident.title,
                    });
                }

            },
            redactIncident(){
                this.$Modal.confirm({
                    title: 'Redact Incident',
                    content: '<p>Are you sure you want to redact this incident? This will delete its description, incident key and log entries.</p>',
                    onOk: () => {
                        VueUtil(this).select('Incidents').action('redact', {id: this.incident.id});
                    }
                });
            },
            getIncident(){
                VueUtil(this).select("Incidents").get({
                    id: this.$route.params.id,
                    include: ['services', 'assignees']
                });
            },
            openReassign(){
                this.modal.reAssign = true;
            },
            openResponder(){
                this.modal.responder = true;
            },
            clickTab(name){
                this.currentTab = name;
                this.$router.push(`/incidents/${this.$route.params.id}/${name}`)
            },
            updateStatus(status){
                VueUtil(this).select('Incidents').action('manage', [
                    {
                        id: this.incident.id,
                        status: status,
                    }
                ]);
            },
            snooze(duration){
                if (_.isNumber(duration)) {
                    VueUtil(this).select('Incidents').action('manage', [
                        {
                            id: this.incident.id,
                            duration: duration,
                        }
                    ]);
                } else if (duration === 'others') {
                    this.modal.snooze = true;
                }
            },
        },

        mounted(){
            this.getIncident();
            this.currentTab = this.$route.params.tab;
            if (_.get(this.Users, "all.data.list", []).length === 0) {
                VueUtil(this).select("Users").all();
            }
        },
        watch: {
            "Incidents.get": "listenIncidents",
            "Incidents.manage": "listenIncidents",
            "Incidents.merge": "listenIncidents",
            "Services.get": "listenServices",
            "Incidents.update": "listenIncidents",
            "Incidents.redact": "listenIncidents",
            "Incidents.reassign": "listenIncidents",
            "Incidents.responder": "listenIncidents",
        },
        props: {},
        data(){
            return {
                moment: moment,
                Dicts: Dicts,
                isEdit: false,
                incident: {
                    service: {},
                    body: {}
                },
                status: 1,
                loading: true,
                modal: {merge: false, responder: false, reAssign: false, snooze: false},
                currentTab: 'Details',
            }
        }
    }
</script>
