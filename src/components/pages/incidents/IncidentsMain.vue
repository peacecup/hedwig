<template>
    <Row>
        <Col style="padding:0px;">
        <Alert>
            <Row>
                <Col span="12">
                <div style="height: 100;text-align: center; border-right:1px solid #e9eaec;">
                    <p>{{I18n('youropenincidents')}}</p>
                    <p>
                    <h2>
                        <a style="color:darkred" href="javascript:void(0)" @click="changeQuery('triggered','me',true)">
                            {{statistics.self_triggered_count}}
                         {{I18n('triggered')}}
                       </a>
                        <a href="javascript:void(0)" @click="changeQuery('acknowledged','me',true)">
                            {{statistics.self_acknowledged_count}}
                         {{I18n('acknowledged')}}
                       </a>
                    </h2>
                    </p>
                </div>
                </Col>
                <Col span="12">
                <div style="height: 100;text-align: center;">
                    <p>{{I18n('allopenincidents')}}</p>
                    <p>
                    <h2>
                        <a style="color:darkred" href="javascript:void(0)" @click="changeQuery('triggered','all',true)">
                            {{statistics.triggered_count}}
                         {{I18n('triggered')}}
                       </a>
                        <a href="javascript:void(0)" @click="changeQuery('acknowledged','all',true)">
                            {{statistics.acknowledged_count}}
                         {{I18n('acknowledged')}}
                       </a>
                    </h2>
                    </p>
                </div>
                </Col>
            </Row>
        </Alert>
        </Col>
        <Col span="24" style="padding:0px;">
        <Card style="width: 100%">
            <Row type="flex">
                <Col span="18">
                <ButtonGroup>
                    <Button @click="changeQueryStatus('open',true)" :type="status ==='open' ?'primary':'default'">
                        {{I18n('open')}}


                    </Button>
                    <Button @click="changeQueryStatus('triggered',true)"
                            :type="status === 'triggered' ?'info':'default'">
                        {{I18n('triggered')}}


                    </Button>
                    <Button @click="changeQueryStatus('acknowledged',true)"
                            :type="status ==='acknowledged' ?'warning':'default'">
                        {{I18n('acknowledged')}}


                    </Button>
                    <Button @click="changeQueryStatus('resolved',true)" :type="status ==='resolved' ?'error':'default'">
                        {{I18n('resolved')}}


                    </Button>
                    <Button @click="changeQueryStatus('all',true)" :type="status ==='all' ?'success':'default'">
                        {{I18n('anystatus')}}


                    </Button>
                </ButtonGroup>
                </Col>
                <Col span="6" style="text-align:right;">
                <ButtonGroup>
                    <Button @click="assigendTo('me',true)" :type="assigendToMe === 'me' ?'success':'default'">
                        {{I18n('assigndtome')}}


                    </Button>
                    <Button @click="assigendTo('all',true)" :type="assigendToMe === 'all' ?'success':'default'">
                        {{I18n('all')}}


                    </Button>
                </ButtonGroup>
                </Col>
                <Col span="24">
                <IncidentsTools :assignedTo="dicts.assignedTo"
                                position="top"
                                :changePageSizer="changePageSizer" :changePage="changePage" :permission="permission"
                                :selectRows="selectRows"
                                :total="Incidents.list.data.total" :current="Incidents.list.data.offset"
                                :pageSize="query.limit"></IncidentsTools>
                </Col>
                <Col span="24">
                <Table @on-sort-change="sortChange" @on-selection-change="selectionChange" size="small"
                       :loading="Incidents.list.loading"
                       :columns="columns" :data="Incidents.list.data.list">
                </Table>
                </Col>
                <Col span="24">
                <IncidentsTools :assignedTo="dicts.assignedTo"
                                position="bottom"
                                :changePageSizer="changePageSizer" :changePage="changePage" :permission="permission"
                                :selectRows="selectRows"
                                :total="Incidents.list.data.total" :current="Incidents.list.data.offset"
                                :pageSize="query.limit"></IncidentsTools>
                </Col>
            </Row>
        </Card>
        </Col>
        <IncidentsEdit v-key="['incident.new']" v-if="service === null" v-model="modal"></IncidentsEdit>
    </Row>
</template>

<script>
    import _ from 'lodash';
    import store from 'store';
    import moment from 'moment';
    import {VueUtil, FormUtil, Dicts, PermissionUtil} from '@util';
    import IncidentsTools from './IncidentsTools.vue';
    import IncidentsEdit from './IncidentsEdit.vue';
    import IncidentShowDetails from './IncidentShowDetails.vue';
    import UserRender from '../configuration/users/UserRender.vue';

    export default{
        components: {IncidentsTools, UserRender, IncidentsEdit, IncidentShowDetails},
        computed: {
            ...VueUtil(this).select(['Incidents', 'Services', 'Users', 'EscalationPolicies']).state(),
        },

        props: {
            service: {
                type: Object,
                default: null,
            },
            servicePermission: {
                type: [Boolean],
                default: false,
            }
        },
        destroyed(){
            VueUtil(this).select('Incidents').clear(['list', 'statistics']);
        },
        mounted(){
            if(this.service){
                this.query.service_ids = [this.service.id];
            }
            this.changeQueryStatus('open', true);
        },
        watch: {
            'Incidents.save': 'listenIncidents',
            'Incidents.update': 'listenIncidents',
            'Incidents.delete': 'listenIncidents',
            'Incidents.merge': 'listenIncidents',
            'Incidents.manage': 'listenIncidents',
            'Incidents.list': 'listenIncidents',
            'Incidents.reassign': 'listenIncidents',
            'Incidents.statistics': 'listenIncidents',
            'service': 'listenService',
        },
        methods: {
            ...VueUtil(this).select(['Incidents', 'Services', 'Users', 'EscalationPolicies']).actions(),
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            listenService(nVal, oVal){
                if (nVal.id === oVal.id) {
                    return null;
                }
                this.query.service_ids = [nVal.id];
                this.changePage(1);
            },

            changeQuery(status, target, refresh){
                this.changeQueryStatus(status, false);
                this.assigendTo(target, false);
                if (refresh)
                    this.changePage(1);
            },
            changeQueryStatus(status, refresh){
                this.status = status;
                if (status === 'all') {
                    this.query['statuses'] = null;
                } else if (status === 'open') {
                    this.query['statuses'] = ['triggered', 'acknowledged'];
                } else {
                    this.query['statuses'] = [this.status];
                }
                if (refresh)
                    this.changePage(1);
            },
            assigendTo(target, refresh){
                if (target === 'me') {
                    this.query['user_ids'] = [store.get('id')];
                    this.assigendToMe = 'me';
                } else {
                    this.query['user_ids'] = null;
                    this.assigendToMe = 'all';
                }
                if (refresh)
                    this.changePage(1);
            },
            newService(){
                this.$router.push("/service/add");
            },
            selectionChange(rows){
                if (this.servicePermission) {
                    this.permission = true;
                } else {
                    if (rows.length > 0 && _.filter(rows, row => row.status === 'resolved').length === 0) {
                        if (PermissionUtil.role.isObserver() || PermissionUtil.role.isRestrict()) { //observer 角色 可操作 分配给自己或需自己协助的事件
                            if (_.filter(rows, row => PermissionUtil.incident.assignToMe(row) || PermissionUtil.incident.respondToMe(row)).length === rows.length) {
                                this.permission = true;
                            } else
                                this.permission = false;
                        } else {
                            this.permission = true;
                        }
                    } else {
                        this.permission = false;
                    }
                }

                this.selectRows = rows;
            },
            openModal(){
                this.modal = true;
                this.loading = false;
            },

            resetForm(){
                this.$refs['form'].resetForm();
            },
            deleteIncidents(id){
                VueUtil(this).select('Incidents').delete(id);
            },
            updateIncidents(user){
                VueUtil(this).select('Incidents').update(user);
            },
            changePage(page){
                page ? this.query.offset = page : null;
                this.permission = false;
                VueUtil(this).select('Incidents').list(this.query).action('statistics', {
                    statistics: true,
                    service_ids: this.query.service_ids,
                    user_ids: [store.get('id')]
                });
            },
            changePageSizer(pageSize){
                this.query.limit = pageSize;
                this.changePage();
            },
            sortChange({key, order}){
                this.query = {...this.query, sortField: key, sortOrder: order};
                this.changePage();
            },

            listenIncidents(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'get') {
                        this.formValidate = data.data;
                        this.openModal();
                    } else if (data.type === 'statistics') {
                        this.statistics = data.data;
                    } else if (data.type === 'list') {

                    } else {
                        switch (data.type) {
                            case 'manage':
                                this.$Message.success(`operate success!`);
                                break;
                            case 'reassign':
                                this.$Message.success(`reassign success!`);
                                break;
                            case 'save':
                                break;
                            case 'statistics':
                                break;
                            default:
                                this.$Message.success(`${data.type} success!`);
                                break;
                        }
                        setTimeout(() => {
                            this.changePage();
                        }, 600);
                    }
                }).error();
            },
        },

        data(){
            const fields = [
                {type: 'selection', width: 60, align: 'center', scope: ['column']},
                {
                    id: "type",
                    type: "hidden",
                    defaultValue: "incidents",
                },
                {
                    id: "status",
                    label: "Status",
                    sortable: "custom",
                    width: "140px",
                    scope: ['column'],
                    render: (h, param) => {
                        return h('div', {
                            style: {
                                color: Dicts.incident_status[param.row.status].color,
                            },
                        }, param.row.status)
                    }
                },
                {
                    id: "urgency", label: "Urgency", sortable: "custom",
                    width: "120px",
                    filterRemote: (value, row) => {
                        this.query.urgencies = value.length === 1 ? [value[0]] : null;
                        this.changePage();
                    },
                    filters: [
                        {
                            label: 'high',
                            value: 'high'
                        },
                        {
                            label: 'low',
                            value: 'low'
                        }
                    ],
                    filterMultiple: false,
                    scope: ['column']
                },
                {
                    id: "title",
                    label: "Title",
                    sortable: "custom",
                    rules: [
                        {required: true, message: this.I18n('valid.required'), trigger: 'blur'},
                        {max: 40, message: this.I18n('valid.required'), trigger: 'blur'},
                    ],
                    render: (h, param) => {
                        const title = param.row.title.length > 70 ? (param.row.title.substring(0, 70) + '...') : param.row.title;
                        return h("div", {
                            style: {
                                position: 'relative',
                                minHeight: '50px',
                                paddingTop: "16px",
                                paddingLeft: "3px",
                            }
                        }, [h("permission-router-link", {
                            props: {
                                target: param.row,
                                type: 'incident',
                            },
                        }, title),
                            h("p", {}, [
                                h(IncidentShowDetails, {
                                    props: {
                                        incident: param.row,
                                    }
                                })
                            ]),
                            h("span", {
                                props: {},
                                style: {
                                    position: 'absolute',
                                    right: '0px',
                                    bottom: '0px',
                                }
                            }, `#${param.row.incident_number}`),
                        ]);
                    }
                },
                {
                    id: "created_at", label: "Created", sortable: "custom",
                    width: "150px",
                    render: (h, param) => {
                        return moment(param.row.created_at).format(this.$t('date.dateTimeFull'));
                    }
                },
                {
                    id: "service",
                    label: "Service",
                    width: "130px",
                    rules: [
                        {required: true, message: this.I18n('valid.required')},
                    ],
                    render: (h, param) => {
                        return h('permission-router-link', {
                            props: {
                                target: param.row.service,
                                type: 'service',
                            }
                        }, param.row.service.summary)
                    }
                },
                {
                    id: "assignments",
                    label: "assignedto",
                    width: "130px",
                    render: (h, params) => {
                        let assignee = _.get(params, 'row.assignments[0].assignee', null);
                        if (assignee) {
                            return h('router-link', {
                                props: {
                                    to: `/users/${assignee.id}`,
                                }
                            }, assignee.summary);
                        } else {
                            return '--';
                        }
                    }
                },
            ]
            const formUtil = FormUtil(this).initFields(fields);
            let query = formUtil.defaultQuery({include: ["assignees", "services"]});
            const dicts = {
                assignedTo: [],
            }

            return {
                dicts,
                query,
                assigendToMe: 'all',
                statistics: {},
                selectRows: [],
                permission: false,
                status: 'open',
                modalTitle: "",
                loading: false,
                modal: false,
                editFields: formUtil.editFields(),
                queryFields: formUtil.queryFields(),
                formValidate: formUtil.forms(),
                ruleValidate: formUtil.rules(),
                columns: [
                    ...formUtil.columns(),
                ]
            }
        }
    }
</script>
