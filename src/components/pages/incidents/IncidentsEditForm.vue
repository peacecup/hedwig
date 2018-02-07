<template>
    <div>
        <DynamicForm :dicts="dicts" :button="{enabled:false}" :labelWidth="110"
                     :loading="loading"
                     ref="form"
                     :editFields="editFields"
                     :submit="saveIncidents"
                     :ruleValidate="ruleValidate"
                     :formValidate="formValidate"></DynamicForm>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'IncidentsEditForm',
        components: {},
        computed: {
            ...VueUtil(this).select(['Incidents', 'Services', 'Users', 'EscalationPolicies']).state(),
        },
        props: {
            value: {
                default: false,
            },
            service: {
                type: Object,
                default: null
            },
            success: Function,
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
                    id: "title",
                    label: "title",
                    type: "input",
                    sortable: "custom",
                    span: 22,
                    formIndex: 3,
                    rules: [
                        {required: true, message: this.$t('valid.required'), trigger: 'blur'},
                        {max: 2048, message: this.$t('valid.required'), trigger: 'blur'},
                        {validator: FormUtil(this).validator.noSpecialWord, trigger: 'blur'},
                    ],
                },
                {
                    id: "responder",
                    label: "Responder",
                    type: "select-group-tabs",
                    options: "assignedTo",
                    filterable: true,
                    span: 22,
                    defaultValue: [],
                    scope: ['form'],
                    formIndex: 5,
                    multiple: true
                },
                {
                    id: "service",
                    label: "service",
                    type: "select",
                    span: 22,
                    formIndex: 1,
                    options: "services",
                    filterable: true,
                    onchange: this.serviceChange,
                    rules: [
                        {required: true, message: this.$t('valid.required')},
                    ],
                },
                {
                    id: "assignments",
                    label: "assignedto",
                    type: "select-group-tabs",
                    options: "assignedTo",
                    filterable: true,
                    span: 22,
                    formIndex: 2,
                    rules: [
                        {required: true, message: this.$t('valid.required')},
                    ],
                },
                {
                    id: "details",
                    label: "description",
                    type: "textarea",
                    span: 22,
                    formIndex: 6,
                    scope: ['form'],
                    rules: [
                        {max: 4096, message: this.$t('valid.required'), trigger: 'blur'},
                        {validator: FormUtil(this).validator.noSpecialWord, trigger: 'blur'},
                    ],
                },
            ]
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            let query = formUtil.defaultQuery();
            query.include = ["assignees", "services"];
            const dicts = {
                services: [],
                assignedTo: [
                    {}, {}
                ],
                responder: [],
            }
            return {
                dicts,
                escalationPoliciesOptions: {},
                usersOptions: {},
                loading: false,
                editFields: formUtil.editFields(),
                formValidate: formUtil.forms(),
                ruleValidate: formUtil.rules(),
            }
        },
        watch: {
            'service': 'listenService',
            'Incidents.get': 'listenIncidents',
            'Incidents.save': 'listenIncidents',
            'Incidents.update': 'listenIncidents',
            'Services.all': 'listenServices',
            'Users.all': 'listenUsers',
            'EscalationPolicies.all': 'listenEscalationPolicies',
            value(val){
                if (!val) {
                    this.$refs['form'].resetForm();
                } else {
                    this.loadData();
                    if (this.service)
                        this.formValidate.service = this.service.id;
                }
            }
        },
        mounted(){
            this.loadData();
        },
        methods: {
            ...VueUtil(this).select(['Incidents', 'Services', 'Users', 'EscalationPolicies']).actions(),
            loadData(){
                VueUtil(this)
                    .select("Services").all({
                    include: ['escalation_policy'],
                });
            },
            serviceChange(id){
                if (_.get(this.Services, 'all.data.list', null) != null) {
                    let filter = _.filter(this.Services.all.data.list, service => service.id === id);
                    if (filter && filter.length > 0) {
                        let esId = filter[0].escalation_policy.id;
                        this.formValidate.assignments = `e_${esId}`;
                    }
                }
            },

            listenEscalationPolicies(data){
                VueUtil(this).cb(data).success(() => {
                    let escalationPolicies = {
                        name: "EscalationPolicies",
                        list: _.map(data.data.list, u => {
                            return {label: u.summary, value: `e_${u.id}`};
                        })
                    }
                    this.escalationPoliciesOptions = escalationPolicies;
                    VueUtil(this).select('Users').all();
                    this.initAssignments();
                }).error()
            },
            listenUsers(data){
                VueUtil(this).cb(data).success(() => {
                    let users = {
                        name: "Users",
                        list: _.map(data.data.list, u => {
                            return {label: u.name, value: `u_${u.id}`};
                        })
                    }
                    this.usersOptions = users;
                    this.dicts.assignedTo[0] = this.escalationPoliciesOptions;
                    this.dicts.assignedTo[1] = users;
                    this.setLoading(false);
                }).error()
            },
            initAssignments(service) {
                if (!service) {
                    service = this.service;
                }
                if (_.get(service, 'escalation_policy.id', null) !== null) {
                    this.formValidate.assignments = `e_${service.escalation_policy.id}`;
                }
            },
            listenService(service){
                this.formValidate.service = service.id;
                this.editFields[0].disabled = true;
//                this.initAssignments(service);
            },
            listenServices(data){
                this.setLoading(true);
                VueUtil(this).cb(data).success(() => {
                    this.dicts.services = _.map(data.data.list, d => {
                        return {value: d.id, label: d.name}
                    });
                    VueUtil(this).select('EscalationPolicies').all();
                })
            },

            listenIncidents(data){
                VueUtil(this).cb(data).success(() => {
                    switch (data.type) {
                        case 'save':
                            this.setLoading(false);
                            this.$emit('input', false);
                            if (this.success) {
                                this.success.call();
                            } else {
                                this.$Message.success("create a incident success!");
                            }
                            break;
                    }
                }).error(() => {
                    this.setLoading(false);
                });
            },
            setLoading(loading){
                this.$emit('isLoading', loading);
                this.loading = loading;
            },

            saveIncidents(){
                this.setLoading(true);
                this.$refs['form'].validate({
                    ok: (data) => {
                        VueUtil(this).select('Incidents').save(data, (proxy) => {
                            proxy.service = {id: proxy.service, type: "service_reference"};
                            let assign = proxy.assignments.split("_");
                            if (assign[0] === 'e') {
                                proxy.assignments = null;
                                proxy.escalation_policy = {
                                    id: assign[1],
                                }
                            } else if (assign[0] === 'u') {
                                proxy.assignments = [{assignee: {id: assign[1]}, type: "assignments_reference"}];
                            }
                            if (proxy.responder) {
                                proxy.incidents_responders = _.map(proxy.responder, res => {
                                    let responder = res.split('_');
                                    if (responder[0] === 'u') {
                                        return {
                                            user: {
                                                id: responder[1],
                                            }
                                        };
                                    } else if (responder[0] === 'e') {
                                        return {
                                            escalation_policy: {
                                                id: responder[1],
                                            }
                                        }
                                    }

                                })
                                proxy.responder = null;
                            }

                            proxy.body = {details: proxy.details, type: "incident_body"};
                            return proxy;
                        });
                    }, err: () => {
                        this.setLoading(false);
                    }
                });
            },
        }
    }
</script>