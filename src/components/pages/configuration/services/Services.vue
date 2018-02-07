<template>
    <div class="service">
        <Row type="flex">
            <Col span="24">
            <Row type="flex" style="width: 100%;border-bottom: 1px solid #e9eaec">
                <Col span="12">
                    <h1>{{title}} {{title_teams}}</h1>
                </Col>
                <Col span="12">
                <div style="text-align: right">
                    <Form ref="queryForm" :model="query" onSubmit="return false;">
                        <Input icon="search" :maxlength="30" v-model="query.query" placeholder="Search..."
                               style="width: 200px"/>
                        <Button style="display: none" htmlType="submit" @click="changePage(1)" icon="search"></Button>
                        <Button v-if="title === 'Services on'" v-key="`service.new`" @click="btnClick('/services/add')" icon="plus" type="success">{{I18n('add services')}}</Button>
                        <Button v-if="title === 'Maintenance Windows on'" v-key="`service.new_maintenance`" @click="btnClick('/maintenance/add')" icon="plus" type="success">{{I18n('add maintenance')}}</Button>
                    </Form>
                </div>
                </Col>
            </Row>
            <Row>
                <Col span="24">
                <Tabs :value="currentTab" :animated="false" @on-click="changeTabs">
                    <Tab-pane :label="I18n('services')" name="Services">
                        <Row>
                            <Col span="24">
                            <div style="float: right;">
                                <Page :total="Services.list.data.total" :current="Services.list.data.offset"
                                      size="small"
                                      :page-size="query.limit"
                                      @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                                      show-sizer></Page>
                            </div>
                            </Col>
                            <Col span="24">
                            <Table @on-sort-change="sortChange" size="small" :columns="columns"
                                   :data="Services.list.data.list" :loading="Services.list.loading"></Table>

                            </Col>
                            <Col span="24">
                            <div style="float: right;">
                                <Page :total="Services.list.data.total" :current="Services.list.data.offset"
                                      size="small"
                                      :page-size="query.limit"
                                      @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                                      show-sizer></Page>
                            </div>
                            </Col>
                        </Row>
                    </Tab-pane>
                    <Tab-pane :label="I18n('maintenances')" name="Maintenance">
                        <Maintenance></Maintenance>
                    </Tab-pane>
                </Tabs>
                </Col>
            </Row>
            </Col>
            <!--<Col span="4">-->
            <!--<Card>-->
            <!--<p slot="title">-->
            <!--Resources-->
            <!--</p>-->
            <!--<ul>-->
            <!--<li>Adding Services</li>-->
            <!--<li>Best Practices for Services</li>-->
            <!--<li>Creating Maintenance Windows</li>-->
            <!--<li>How to Trigger an Incident</li>-->
            <!--<li>Get More Help</li>-->
            <!--<li>Find more answers in our Knowledge Base</li>-->
            <!--<li>Chat with Support</li>-->
            <!--</ul>-->
            <!--</Card>-->
            <!--</Col>-->

            <Modal width="600px" v-model="modal.scheduleMaintenance" title="Create New Maintenance Window"
                   :loading="loading" :mask-closable="false"
                   @on-ok="saveMaintenance">
                <MaintenanceEditForm :success_cb="saveMaintenanceSuccess" :service_id="select_service_id"
                                     ref="maintenanceEditForm"></MaintenanceEditForm>
                <div slot="footer">
                    <Button size="large" :disabled="loading" @click="modal.scheduleMaintenance = false">{{$t('button.cancel')}}</Button>
                    <Button type="primary" size="large" :loading="loading" @click="saveMaintenance">{{ $t('button.submit') }}</Button>
                </div>
            </Modal>
            <IncidentsEdit v-model="incidentModal" :service="selectService" :success="changePage"></IncidentsEdit>
        </Row>
    </div>
</template>
<script>
    import {VueUtil, FormUtil, Dicts} from '@util';
    import iView from 'iview';
    import moment from 'moment';
    import DropMenuDecorator from '@common/DropMenuDecorator.vue';
    import Maintenance from './Maintenance.vue';
    import MaintenanceEditForm from './MaintenanceEditForm.vue';

    import IncidentsEdit from '../../incidents/IncidentsEdit.vue'

    export default {
        components: {
            Maintenance, MaintenanceEditForm, IncidentsEdit
        },
        computed: {
            ...VueUtil(this).select(['Services', 'Teams','Incidents']).state(),
        },
        destroyed(){
            VueUtil(this).select('Services').clear(['list','get']);
        },
        methods: {
            ...VueUtil(this).select(['Services', 'Teams','Incidents']).actions(),
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            saveMaintenanceSuccess(){
                this.modal.scheduleMaintenance = false;
            },
            saveMaintenance(){
                this.$refs['maintenanceEditForm'].saveMaintenance();
            },
            changeTabs(name){
                if (name === 'Services') {
                    this.title = 'Services on';
                    this.$router.push("/services");
                } else if (name === 'Maintenance') {
                    this.title = 'Maintenance Windows on';
                    this.$router.push("/maintenance");
                }
            },
            btnClick(path){
                this.$router.push(path);
            },

            deleteServices(id){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select('Services').delete(id);
                    }
                });
            },
            sortChange({key, order}){
                this.query = {...this.query, sortField: key, sortOrder: order};
                this.changePage();
            },
            changePage(page){
                page ? this.query.offset = page : null;
                if (!this.query.team_ids && _.get(this.Teams, 'choose.data.id', null) !== null) {
                    this.query.team_ids = [_.get(this.Teams, 'choose.data.id', null)];
                }
                VueUtil(this).select('Services').list(this.query);
            },
            changePageSizer(pageSize){
                this.query.limit = pageSize;
                VueUtil(this).select('Services').list(this.query);
            },
            listenChooseTeams(team){
                if (_.get(team, 'data.id', null)) {
                    this.title_teams = `${team.data.name}`;
                    this.query.team_ids = [team.data.id];
                } else {
                    this.title_teams = `All Teams`;
                    this.query.team_ids = null;
                }
                this.changePage();
            },
            listenServices(data){
                VueUtil(this).cb(data).success
                (() => {
                    if (data.type === 'list') {

                    } else {
                        this.$Message.success(`${data.type} success!`);
                        setTimeout(() => {
                            this.modal = false;
                            this.changePage();
                            this.loading = data.loading;
                        }, 600);
                    }
                }).error()
            },
            listenScheduleMaintenanceModal(data){
                this.resetForm('maintenanceEditForm');
            },

            resetForm(form){
                if (this.$refs[form] && this.$refs[form].handleReset)
                    this.$refs[form].handleReset(form);
            },
            operate(id){
                var $id = id.split("/");
                switch ($id[0]) {
                    case 'view':
                        this.$router.push(`/services/${$id[1]}/detail`);
                        break;
                    case 'edit':
                        this.$router.push(`/services/${$id[1]}/edit`);
                        break;
                    case 'newIncident':
                        this.selectService = {id: $id[1]};
                        this.incidentModal = true;
                        break;
                    case 'delete':
                        this.deleteServices(_.parseInt($id[1]));
                        break;
                    case 'scheduleMaintenance':
                        this.select_service_id = $id[1];
                        this.modal.scheduleMaintenance = true;
                        break;
                }
            },
            listenIncidents(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'save') {
                        this.$Message.success('save incident success!');
                        this.incidentModal = false;
                    }
                }).error()
            }
        },
        watch:{
            'Incidents.save': 'listenIncidents',
            'Services.delete': 'listenServices',
            'Services.list': 'listenServices',
            'modal.scheduleMaintenance': 'listenScheduleMaintenanceModal',
            'Teams.choose': 'listenChooseTeams',
        },
        // 挂载完毕请求数据
        mounted(){
            this.currentTab = this.$route.path === '/maintenance' ? "Maintenance" : "Services";
            this.changeTabs(this.currentTab);
            this.listenChooseTeams(this.Teams.choose);
        },
        data(){
            const dateFormat = this.$t('date.MDTime');
            const icons = Dicts.service_status;
            let fields = [
                {
                    label: 'BLANK',
                    id: 'status',
                    width: '100px',
                    render: (h, param) => {
                        return h('Icon', {
                            props: {
                                size: 20,
                                type: icons[param.row.displayStatus].icon,
                                color: icons[param.row.displayStatus].color,
                            }
                        });
                    },
                },
                {
                    label: 'Service Name',
                    id: 'name',
                    width: '200px',
                    render: (h, params) => {
                        let desc = params.row.description || '';
                        desc = desc.length > 30 ? (desc.substring(0, 30) + '...') : desc;
                        return h('div', [
                            h('permission-router-link', {
                                props: {
                                    type:'service',
                                    target: params.row,
                                }
                            }, params.row.name),
                            h('p', desc),
                        ])
                    }
                }, {
                    label: 'Incidents',
                    id: 'integrationType',
                    render: (h, params) => {
                        return h('div', {}, [
                            h('div', {
                                style: {
                                    color: Dicts.incident_status['acknowledged'].color,
                                },
                                props: {}
                            }, `${params.row.acknowledgedIncidents} acknowledged`),
                            h('div', {
                                props: {
                                    class: 'divider'
                                }
                            }),
                            h('div', {
                                style: {
                                    color: Dicts.incident_status['triggered'].color,
                                },
                                props: {}
                            }, `${params.row.triggeredIncidents} triggered`)
                        ])
                    }
                }, {
                    label: 'Last Incident',
                    id: 'last_incident_timestamp',
                    render: (h, params) => {
                        if (!params.row.last_incident_timestamp)
                            return "";
                        return moment(params.row.last_incident_timestamp).format(dateFormat);
                    },
                }, {
                    label: 'Integrations',
                    id: 'integrations',
                    render: (h, params) => {

                        return h('div', _.map(params.row.integrations, (integration, index) => {
                            return h('p', {
                                style: {
                                    borderTop: index !== 0 ? '1px solid #e9eaec' : 'none',
                                    lineHeight: '30px',
                                }
                            }, [h('permission-router-link', {
                                props: {
                                    type:'integration',
                                    target:{
                                        serviceId: params.row.id,
                                        id: integration.id,
                                    }
                                }
                            }, integration.summary)])
                        }));
                    }
                }, {
                    label: 'Notification',
                    id: 'incident_urgency_rule',
                    render: (h, params) => {
                        return _.get(params.row, 'incident_urgency_rule.urgency', '');
                    }
                }, {
                    label: 'Teams',
                    id: 'teams',
                    render: (h, params) => {
                        return h('div', _.map(params.row.teams, (team, index) => {
                            return h('p', {
                                style: {
                                    borderTop: index !== 0 ? '1px solid #e9eaec' : 'none',
                                    lineHeight: '30px',
                                }
                            }, [h('router-link', {
                                props: {to: `/teams/${team.id}/detail`}
                            }, team.summary)])
                        }));
                    }
                }, {
                    label: 'Escalation Policy',
                    id: 'escalationPolicy',
                    render: (h, params) => {

                        if (_.get(params.row, 'escalation_policy.id', null) === null) {
                            return '';
                        } else {
                            return h('permission-router-link', {
                                props: {
                                    target: params.row.escalation_policy,
                                    type :'policy'
                                }
                            }, _.get(params.row, 'escalation_policy.summary', ''));
                        }
                    }
                },
            ];
            const formUtil = FormUtil(this).initFields(fields);
            let query = {
                ...formUtil.defaultQuery(),
                include : ['incidents', 'integrations', 'teams', 'escalation_policy'],
            };
            const rowMenuList = [
                {title: "view", icon: "search", type: 'view', key:'service.read'},
                {title: "edit", icon: "edit", type: 'edit', key:'service.edit'},
                {title: "Schedule Maintenance", icon: "clock", type: 'scheduleMaintenance', key:{key:'service.new_maintenance'}},
                {title: "New Incident", icon: "plus", type: 'newIncident',key:'service.new_incident'},
                {title: "delete", icon: "trash-a", type: 'delete',key:'service.delete'},
            ]
            return {
                query,
                incidentModal: false,
                selectService: {},
                loading: false,
                select_service_id: null,
                currentTab: "",
                title: 'Services on',
                title_teams: 'All Teams',
                modal: {
                    scheduleMaintenance: false,
                },
                columns: [
                    ...formUtil.columns(),
                    {
                        key: 'id',
                        render: (h, params) => {
                            return h(DropMenuDecorator, {
                                props: {
                                    id : params.row.id,
                                    select: this.operate,
                                    title: 'Operate',
                                    list: rowMenuList,
                                    target:'service',
                                }
                            })
                        }
                    }
                ]
            }
        }
    }
</script>