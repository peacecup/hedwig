<template>
    <div class="service" v-pageKey="{key:`service.read`,ignore:allowView}">
        <Row type="flex" style="width: 100%;">
            <Col span="20">
            <h1>{{service.name}} <span class="status" v-if="!!service.statusShow"
                                       :style="`border:1px solid ${service.statusShow.color};color:${service.statusShow.color};`"><Icon
                    :color="service.statusShow.color"
                    :type="service.statusShow.icon"></Icon> {{ service.statusShow.text || service.displayStatus}}</span>
            </h1>
            <template v-if="Services.on_call.data">
                <h3>On Call Now</h3>
                <div v-if="Services.on_call.data.list && Services.on_call.data.list.length > 0">
                    <template v-for="user in Services.on_call.data.list">
                        <span style="margin-right: 20px;">
                            <Icon type="person"></Icon>
                        <router-link :to="`/users/${user.id}`">{{ user.summary }}</router-link>
                        </span>
                    </template>
                </div>
                <div v-else="">no body on call</div>
            </template>

            <div>This service was created during onboarding on {{service.create_time}}</div>
            <Alert type="success" v-if="service.status === 'active'">Service enabled.</Alert>
            <Alert type="error" v-if="service.status === 'disabled'">Service disabled.</Alert>
            <Tabs :value="currentTab" :animated="false" @on-click="clickTab">
                <Tab-pane name="Incidents" :label="I18n('incidents')">
                    <ServiceIncidents :service="service" :permission="permission"></ServiceIncidents>
                </Tab-pane>
                <Tab-pane name="Integrations" :label="I18n('integrations')">
                    <ServiceIntegrations :permission="permission"></ServiceIntegrations>
                </Tab-pane>
                <Tab-pane name="Settings" :label="I18n('settings')">
                    <ServiceSettings :service="service"></ServiceSettings>
                </Tab-pane>
                <Tab-pane name="EventRules" :label="I18n('event rules')">
                    <EventRules :service="service" :permission="permission"></EventRules>
                </Tab-pane>
            </Tabs>
            </Col>

            <Col span="4">
            <Spin fix size="large" v-if="loading"></Spin>
            <div class="service-buttons" v-show="!loading">
                <Button v-key="{key:`service.edit`,ignore:permission}" icon="edit" @click="toEditService">
                    {{I18n('edit service')}}

                </Button>
                <Button v-key="{key:`service.dis_or_en_able`,ignore:permission}" icon="ios-pause"
                        v-if="service.status === 'active'"
                        @click="disabledService">
                    {{I18n('disabled service')}}






                </Button>
                <Button v-key="{key:`service.dis_or_en_able`,ignore:permission}" icon="checkmark-round"
                        v-if="service.status !== 'active'"
                        @click="enabledService">
                    {{I18n('enabled service')}}





                </Button>
                <Button v-key="{key:`service.new_maintenance`,ignore:permission}" icon="clock"
                        @click="openScheduleMaintenance">
                    {{I18n('schedule maintenance')}}


                </Button>
                <Button v-key="{key:'service.new_incident',ignore:permission}" :disabled="service.status !== 'active'"
                        icon="plus"
                        @click="modal.incident = true">
                    {{I18n('new incident')}}






                </Button>
                <Button v-key="{key:`service.delete`,ignore:permission}" icon="close" @click="deleteService">
                    {{I18n('delete service')}}

                </Button>
            </div>
            <Card>
                <p slot="title">
                    {{I18n('service maintenance')}}
                </p>
                <div class="service-maintenace-body">
                    <div style="position: relative;">
                        <h4>In Progress</h4>
                    </div>
                    <transition name="fade">

                        <div v-if="!maintenanceList.OnGoing || maintenanceList.OnGoing.length === 0">None</div>
                        <div v-else-if="maintenanceList.OnGoing.length > 1">
                            <div v-for="m in maintenanceList.OnGoing">
                                <permission-router-link :target="{serviceId:service.id ,id:m}" type="maintenance" action="edit">
                                    {{ moment(m.start_time).format($t('date.MDTime'))
                                    }} ~ {{moment(m.end_time).format($t('date.MDTime')) }}



                                </permission-router-link>
                            </div>
                        </div>
                        <div v-else>
                            <div v-for="m in maintenanceList.OnGoing" style="position: relative">
                                <router-link v-key="{key:`service.edit_maintenance`,ignore:permission}"
                                             class="maintenance-edit"
                                             :to="`/maintenance/${m.id}/edit`">
                                    <Icon type="edit"></Icon>
                                </router-link>
                                <Row>
                                    <Col span="12">
                                    Started on</Col>
                                    <Col span="12" class="text-align-left">
                                    {{ moment(m.start_time).format($t('date.MDTime')) }}</Col>
                                    <Col span="12">
                                    Ends on</Col>
                                    <Col span="12" class="text-align-left">
                                    {{moment(m.end_time).format($t('date.MDTime')) }}</Col>
                                    <Col span="12">
                                    Created by</Col>
                                    <Col span="12" class="text-align-left">
                                    <Icon type="person" size="large"></Icon>
                                    <router-link :to="`/users/${m.created_by.id}`">{{m.created_by.summary}}


                                    </router-link>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </transition>


                    <div class="divider"></div>
                    <h4 style="position: relative;">Upcoming</h4>
                    <transition name="fade">
                        <div v-if="!maintenanceList.Future || maintenanceList.Future.length === 0">None</div>
                        <div v-else-if="maintenanceList.Future.length > 1">
                            <div v-for="m in maintenanceList.Future">
                                <router-link :to="`/maintenance/${m.id}/edit`">

                                    {{ moment(m.start_time).format($t('date.MDTime'))
                                    }} ~ {{moment(m.end_time).format($t('date.MDTime')) }}



                                </router-link>
                            </div>
                        </div>
                        <div v-else>
                            <div v-for="m in maintenanceList.Future" style="position: relative;">
                                <router-link v-key="{key:`service.edit_maintenance`,ignore:permission}"
                                             class="maintenance-edit"
                                             :to="`/maintenance/${m.id}/edit`">
                                    <Icon type="edit"></Icon>
                                </router-link>
                                <Row style="font-size: 12px;">
                                    <Col span="12">
                                    Started on</Col>
                                    <Col span="12" class="text-align-left">
                                    {{ moment(m.start_time).format($t('date.MDTime')) }}</Col>
                                    <Col span="12">
                                    Ends on</Col>
                                    <Col span="12" class="text-align-left">
                                    {{moment(m.end_time).format($t('date.MDTime')) }}</Col>
                                    <Col span="12">
                                    Created by</Col>
                                    <Col span="12" class="text-align-left">
                                    <Icon type="person" size="large"></Icon>
                                    <router-link :to="`/users/${m.created_by.id}`">{{m.created_by.summary}}


                                    </router-link>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </transition>
                    <transition name="fade">
                        <div v-key="{key:`service.new_maintenance`,ignore:permission}"
                             v-if="(!maintenanceList.OnGoing || maintenanceList.OnGoing.length === 0 )">
                            <div class="divider"></div>
                            <h4>Immediate Maintenance</h4>
                            <Button size="small" @click="mantenance(5)"> 5 min</Button>
                            <Button size="small" @click="mantenance(15)"> 15 min </Button>
                            <Button size="small" @click="mantenance(30)">30 min</Button>
                            <Button size="small" @click="mantenance(60)">60 min</Button>
                        </div>
                    </transition>
                </div>
            </Card>
            </Col>
            <IncidentsEdit v-key="{key:['service.new_incident'],ignore:permission}" v-model="modal.incident"
                           :service="service"></IncidentsEdit>
            <Modal v-key="{key:['service.new_maintenance'],ignore:permission}" width="600px"
                   v-model="modal.scheduleMaintenance"
                   title="Create New Maintenance Window"
                   :loading="loading" :mask-closable="false"
                   @on-ok="saveMaintenance">
                <MaintenanceEditForm :success_cb="saveMaintenanceSuccess" :service_id="service.id"
                                     v-model="editMaintenance"
                                     ref="maintenanceEditForm"></MaintenanceEditForm>
                <div slot="footer">
                    <Button size="large" :disabled="loading" @click="modal.scheduleMaintenance = false">
                        {{$t('button.cancel')}}



                    </Button>
                    <Button type="primary" size="large" :loading="loading" @click="saveMaintenance">
                        {{$t('button.submit')}}



                    </Button>
                </div>
            </Modal>
        </Row>
    </div>
</template>
<script>

    import {VueUtil, FormUtil, ScheduleUtil, Dicts, PermissionUtil} from '../../../../libs';
    import ServiceIncidents from './ServiceIncidents.vue';
    import ServiceIntegrations from './ServiceIntegrations.vue';
    import ServiceSettings from './ServiceSettings.vue';
    import MaintenanceEditForm from './MaintenanceEditForm.vue';
    import EventRules from './EventRules.vue';
    import IncidentsEdit from '../../incidents/IncidentsEdit.vue';

    import Vue from 'vue';
    import moment from 'moment';
    export default {
        components: {
            ServiceIncidents,
            ServiceIntegrations,
            ServiceSettings,
            EventRules,
            IncidentsEdit,
            MaintenanceEditForm,
        },
        computed: {
            ...VueUtil(this).select(['Services', 'Maintenance', 'Incidents', 'System']).state(),
            permission(){
                console.log(this.service.id)
                return PermissionUtil.service.allowEdit({id: this.$route.params.id});
            },
            allowView(){
                return PermissionUtil.service.allowView({id: this.$route.params.id});
            }
        },
        destroyed(){
            VueUtil(this).select('Services').clear(['list', 'all', 'get']);
        },
        mounted (){

            this.service = {
                id: this.$route.params.id,
            }
            this.get(this.service.id);
            this.currentTab = this.$route.params.tab;
        },
        methods: {
            ...VueUtil(this).select(['Services', 'Maintenance', 'Incidents', 'System']).actions(),
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            openScheduleMaintenance(maintenance){
                this.modal.scheduleMaintenance = true;
                if (maintenance) {
                    this.editMaintenance = {
                        ...maintenance,
                        services: [this.service.id],
                    };
                } else {
                    this.editMaintenance = null;
                }
            },
            saveMaintenanceSuccess(){
                this.modal.scheduleMaintenance = false;
            },
            saveMaintenance(){
                this.$refs['maintenanceEditForm'].saveMaintenance();
            },

            clickTab(name){
                this.currentTab = name;
                this.$router.push(`/services/${this.$route.params.id}/detail/${name}`)
            },
            mantenance(min){
                this.$Modal.confirm({
                    title: 'Are you sure you want to suspend this service?',
                    content: `<p>This service will be disabled for ${min} minutes. Incoming events will not create incidents.</p>`,
                    onOk: () => {
                        VueUtil(this).select('System').action('times', {
                            min: min,
                        });

                    }
                });
            },

            get(id){
                VueUtil(this).select('Services').get({
                    id: id,
                    include: ['incidents', 'integrations', 'teams', 'escalation_policy'],
                }).action('on_call', {
                    serviceId: id
                });
            },
            saveServices(){
                this.loading = true;
                this.$refs['form'].validate({
                    ok: (data) => {
                        VueUtil(this).select('Services').save(data);
                    }, err: () => {
                        this.loading = false;
                    }
                });
            },
            toEditService(){
                this.$router.push(`/services/${this.$route.params.id}/edit`);
            },
            deleteService(){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select('Services').delete(this.$route.params.id);
                    }
                });
            },
            disabledService(){
                let service = _.cloneDeep(this.service);
                service.status = 'disabled';
                VueUtil(this).select("Services").update(service);
            },
            enabledService(){
                let service = _.cloneDeep(this.service);
                service.status = 'active';
                VueUtil(this).select("Services").update(service);
            },
            getMaintenance(){
                VueUtil(this).select('Maintenance').all({
                    service_ids: [this.service.id],
                    include: ['users'],
                });
            },
            listenServices(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'get') {
                        this.service = {
                            ...data.data,
                            statusShow: Dicts.service_status[data.data.displayStatus],
                        };
                        this.getMaintenance();
                        this.loading = false;
                    } else if (data.type === 'update') {
                        this.$Message.success(`update success!`);
                        this.get(this.$route.params.id);
                    } else if (data.type === 'delete') {
                        this.$Message.success(`delete success!`);
                        setTimeout(() => {
                            this.$router.push("/services");
                        }, 600)
                    }
                }).error();
            },
            listenMaintenance(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'all') {
                        this.maintenanceList = _.chain(data.data.list).filter(m => m.status !== 'Past').groupBy(m => m.status).value();
                    } else if (data.type === 'save' || data.type === 'update') {
                        this.getMaintenance();
                        this.get(this.service.id);
                    }
                }).error();
            },
            listenMaintenanceModal(modal){
                this.$refs['maintenanceEditForm'].resetForm();
            },
            listenIncidents(data) {
                VueUtil(this).cb(data).success(() => {
                    this.get(this.service.id);
                })
            },
            listenTimes(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'times' && data.request.min) {
                        let start = moment(data.data);
                        let end = moment(data.data).add(data.request.min * 1, 'm');
                        VueUtil(this).select('Maintenance').save({
                            services: [{id: this.service.id}],
                            timeZone: Vue.config.timezone,
                            start_time: ScheduleUtil.momentToString(start),
                            end_time: ScheduleUtil.momentToString(end),
                        })
                    }
                }).error();
            }

        },
        watch: {
            'Incidents.save': 'listenIncidents',
            'Incidents.update': 'listenIncidents',
            'Incidents.manage': 'listenIncidents',
            'Services.get': 'listenServices',
            'Services.update': 'listenServices',
            'Services.delete': 'listenServices',
            'Maintenance.save': 'listenMaintenance',
            'Maintenance.update': 'listenMaintenance',
            'Maintenance.all': 'listenMaintenance',
            'modal.scheduleMaintenance': 'listenMaintenanceModal',
            'System.times': 'listenTimes',
        },
        data(){
            let fields = [
                {
                    id: 'id',
                    type: 'hidden',
                },
                {
                    span: 18,
                    label: 'Name',
                    type: 'input',
                    style: {width: '400px'},
                    id: 'name',
                    rules: [
                        {required: true, message: 'name is required', trigger: 'blur'},
                    ]
                }, {
                    span: 18,
                    label: 'Description',
                    style: {width: '400px'},
                    type: 'textarea',
                    id: 'description',
                    rules: [
                        {required: true, message: 'name is description', trigger: 'blur'},
                    ]
                }, {
                    span: 18,
                    label: 'Integration Type',
                    type: 'radio',
                    style: {display: 'flex', flexDirection: 'column'},
                    options: [
                        {value: '1', label: 'Select Tools'},
                        {value: '2', label: 'Integrate via email'},
                        {value: '3', label: 'Use our API directly'},
                        {value: '4', label: 'Don\'t use an integration'},
                    ],
                    id: 'integrationType',
                    rules: [
                        {required: true, message: 'integrationType is description', trigger: 'blur'},
                    ]
                }, {
                    span: 18,
                    label: 'Integration Name',
                    style: {width: '400px'},
                    type: 'input',
                    id: 'integrationName',
                }, {
                    span: 18,
                    label: 'Integration Email',
                    style: {width: '400px'},
                    type: 'input',
                    id: 'integrationEmail',
                }, {
                    span: 18,
                    label: 'Escalation Policy',
                    style: {width: '400px'},
                    type: 'input',
                    id: 'escalationPolicy',
                }, {
                    label: 'How should responders be notified?',
                    id: 'Teams',
                    style: {width: '400px'},
                    span: 18,
                    type: 'select',
                }, {
                    label: 'Incident Timeouts',
                    span: 18,
                    style: {display: 'flex', flexDirection: 'column'},
                    type: 'checkbox',
                    options: [
                        {value: 'Acknowledgement timeout', label: 'Acknowledgement timeout'},
                        {value: 'Auto-resolution', label: 'Auto-resolution'},
                    ],
                    id: 'incidentTimeouts',
                },
            ]
            const formUtil = FormUtil(this).initFields(fields);
            return {
                Dicts: Dicts,
                service: {
                    statusShow: {}
                },
                currentTab: null,
                maintenanceList: {
                    OnGoing: [],
                },
                loading: true,
                modal: {
                    scheduleMaintenance: false,
                    incident: false,
                    merge: false,
                },
                editMaintenance: null,
                editFields: formUtil.editFields(),
                formValidate: formUtil.forms(),
                ruleValidate: formUtil.rules(),
                button: {
                    enable: true,
                    submit: this.saveServices,
                    cancel: () => {
                        this.$router.push("/services")
                    }
                }

            }
        }
    }
</script>