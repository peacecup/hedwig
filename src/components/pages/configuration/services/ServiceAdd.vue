<template>
    <div v-pageKey="{key:`service.new`, ignore: permission}">
        <Row type="flex" style="width: 100%;border-bottom: 1px solid #e9eaec">
            <Col span="20">
            <h1 style="width: 100%;border-bottom: 1px solid #e9eaec">{{title}}</h1>
            <p style="padding:5px 0px;">
                A service may represent an application, component or team you wish to open incidents against.</p>
            <p>
            <div>
                <DynamicForm :loading="loading" :dicts="dicts" ref="form" :editFields="editFields"
                             :submit="saveServices"
                             :ruleValidate="ruleValidate"
                             :formValidate="formValidate" :labelWidth="150" :button="button">
                    <template slot="integrationType">
                        <Form-item :label="I18n('integration type')" prop="integrationType"
                                   style="position: relative">
                            <Radio-group v-model="formValidate['integrationType']">
                                <div v-for="option in dicts['integrationTypes']"
                                     :key="option.value">
                                    <Radio :label="option.value">{{option.label}}</Radio>
                                </div>
                            </Radio-group>
                            <Select style="width:200px;position: absolute;top:0px;"
                                    v-if="formValidate['integrationType'] === 'tools'"
                                    v-model="formValidate['tools']"
                                    prop="tools">
                                <Option value="DataLog">DataLog</Option>
                            </Select>
                        </Form-item>
                    </template>

                    <template slot="integrationName">
                        <transition name="fade">
                            <Form-item :label="I18n('integration name')"
                                       v-if="formValidate['integrationType'] !== 'unuse'"
                                       prop="integrationName">
                                <Input style="width: 400px;" v-model="formValidate['integrationName']"/>
                            </Form-item>
                        </transition>
                    </template>
                    <template slot="integrationEmail">
                        <transition name="fade">
                            <Form-item :label="I18n('integration email')"
                                       v-if="formValidate['integrationType'] === 'email'"
                                       prop="integrationEmail">
                                <Input style="width: 400px;" v-model="formValidate['integrationEmail']"/>
                            </Form-item>
                        </transition>
                    </template>
                    <template slot="incidentTimeouts">
                        <Form-item :label="I18n('incident timeouts')" prop="incidentTimeouts">
                            <Checkbox-group v-model="formValidate['incidentTimeouts']">
                                <div>
                                    <Checkbox label="acknowledgement_timeout">{{ I18n('acknowledgement timeout') }}





                                    </Checkbox>
                                    <div>
                                        <span>Acknowledged incidents will time out after </span><Select
                                            :disabled="disabled.acknowledgement_timeout"
                                            style="width: 150px;"
                                            :initialValue="1800"
                                            v-model="formValidate['acknowledgement_timeout']">
                                        <SelectTimeout></SelectTimeout>
                                    </Select> <span>, and return to the Triggered state. The incident will then re-notify the person to whom it is assigned.</span>
                                    </div>
                                </div>

                                <div>
                                    <Checkbox label="auto_resolve_timeout">{{ I18n('auto resolution') }}</Checkbox>
                                    <div>
                                        <span>Open incidents will auto-resolve in  </span>
                                        <Select
                                                :disabled="disabled.auto_resolve_timeout"
                                                style="width: 150px;"
                                                :initialValue="14400"
                                                v-model="formValidate['auto_resolve_timeout']">
                                            <SelectTimeout></SelectTimeout>
                                        </Select>
                                        <div>
                                            We recommend turning this option on, to ensure you do not forget incidents in the Triggered or Acknowledged states.
                                        </div>
                                    </div>
                                </div>
                            </Checkbox-group>
                        </Form-item>
                    </template>
                </DynamicForm>
            </div>
            </Col>
            <Col span="4">
            </Col>
        </Row>
    </div>
</template>
<script>
    import {VueUtil, FormUtil, ScheduleUtil, PermissionUtil} from '@util';
    import _ from 'lodash';
    import Vue from 'vue';
    import moment from 'moment';
    export default {
        name: "ServiceAdd",
        components: {},
        computed: {
            ...VueUtil(this).select(['Services', 'EscalationPolicies']).state(),
            permission(){
                return PermissionUtil.service.isManager(this.formValidate);
            }
        },
        methods: {
            ...VueUtil(this).select(['Services', 'EscalationPolicies']).actions(),
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            saveServices(){
                this.loading = true;
                this.$refs['form'].validate({
                    ok: (data) => {
                        if (!this.$route.params.id) {
                            VueUtil(this).select('Services').save(data, this.beforeSaveOrUpdate);
                        } else {
                            data.id = this.$route.params.id;
                            VueUtil(this).select('Services').update(data, this.beforeSaveOrUpdate);
                        }
                    }, err: () => {
                        this.loading = false;
                    }
                });
            },
            saveServiceIntegrations(){
                this.loading = true;
                this.$refs['form'].validate({
                    ok: (data) => {
                        VueUtil(this).select('Services').action('saveIntegration', data, this.extractIntegrationData);
                    }, err: () => {
                        this.loading = false;
                    }
                });
            },
            //抽取 integration 数据
            extractIntegrationData(originalData){
                let data = _.cloneDeep(originalData);
                let integrationData = {
                    service: {
                        id: data.id,
                    },
                    type: data.integrationType,
                    name: (data.integrationName && data.integrationName !== '' ? data.integrationName : data.integrationType),
                    integration_email: data.integrationEmail,
                }
                return integrationData;
            },
            //保存前组织数据
            beforeSaveOrUpdate(originalData){
                let data = _.cloneDeep(originalData);
                if (data.escalation_policy !== null) {
                    data.escalation_policy = {
                        type: 'escalation_policy_reference',
                        id: data.escalation_policy
                    };
                }
                if (data.incident_urgency_rule) {
                    let incident_urgency_rules = data.incident_urgency_rule.split("_");
                    data.incident_urgency_rule = {
                        type: incident_urgency_rules[0],
                        urgency: incident_urgency_rules[1],
                    };
                }
                data.support_hours = {
                    type: "fixed_time_per_day",
                    start_time: ScheduleUtil.momentToString(moment({hour: 8, minute: 0})),
                    end_time: ScheduleUtil.momentToString(moment({hour: 17, minute: 0})),
                    days_of_week: [1, 2, 4, 5, 6],
                    time_zone: Vue.config.timezone,
                }
                let temp = {
                    auto_resolve_timeout: data.auto_resolve_timeout,
                    acknowledgement_timeout: data.acknowledgement_timeout
                };

                data.auto_resolve_timeout = null;
                data.acknowledgement_timeout = null;
                _.forEach(data.incidentTimeouts, t => {
                    data[t] = temp[t];
                });
                return data;
            },
            listenServices(data){
                VueUtil(this).cb(data).success(() => {
                    switch (data.type) {
                        case 'save':
                        case 'update':
                            let id = _.get(data, 'data.id', null);
                            if (id) {
                                this.formValidate.id = id;
                                this.saveServiceIntegrations();
                            } else {
                                this.$Message.error(`${data.type} fail!`);
                            }
                            this.$Message.success(`${data.type} success!`);
                            setTimeout(() => {
                                this.loading = data.loading;
                                this.$router.push('/services');
                            }, 600);
                            break;
                        case 'get':
                           if(!data.data.id) return;
                            this.formValidate = {
                                ...data.data,
                                incidentTimeouts: [],
                            };
                            if (_.get(this.formValidate, 'auto_resolve_timeout', false)) {
                                this.formValidate.incidentTimeouts.push('auto_resolve_timeout');
                            }
                            if (_.get(this.formValidate, 'acknowledgement_timeout', false)) {
                                this.formValidate.incidentTimeouts.push('acknowledgement_timeout');
                            }
                            if (_.get(this.formValidate, 'incident_urgency_rule', false)) {
                                this.formValidate.incident_urgency_rule = `${this.formValidate.incident_urgency_rule.type}_${this.formValidate.incident_urgency_rule.urgency}`;
                            }
                            if (_.get(this.formValidate, 'escalation_policy.id', false)) {
                                this.formValidate.escalation_policy = this.formValidate.escalation_policy.id;
                            }
                            break;
                    }
                }).error();
            },
            listenServicesIntegration(data){
                VueUtil(this).cb(data).success(() => {
                    setTimeout(() => {
                        this.loading = data.loading;
                        this.$router.push('/services');
                    }, 600);
                }).error();
            },
            listenIncidentsTimeout(data){

                let disabled = {
                    acknowledgement_timeout: true,
                    auto_resolve_timeout: true,
                };
                _.map(data, key => disabled[key] = false);
                this.disabled = disabled;
                this.log()
            },
            listenEscalationPolicies(data){
                VueUtil(this).cb(data).success(() => {
                    this.dicts.escalationPolicys = _.map(data.data.list, d => {
                        return {value: d.id, label: d.name};
                    })
                }).error();
            },
            log(){
//                console.log(JSON.stringify(this.formValidate))
            }
        },
        mounted(){
            if (this.$route.params.id) {
                VueUtil(this).select('Services').get({id: this.$route.params.id, include: ['escalation_policy']});
                this.title = "Edit a Service";
            }

            VueUtil(this).select('EscalationPolicies').all();
        },
        watch: {
            'Services.get': 'listenServices',
            'Services.update': 'listenServices',
            'Services.delete': 'listenServices',
            'Services.save': 'listenServices',
            'Services.saveIntegration': 'listenServicesIntegration',
            'formValidate.incidentTimeouts': {
                handler: 'listenIncidentsTimeout',
            },
            'EscalationPolicies.all': 'listenEscalationPolicies'
        },
        data(){
            const noSpecial = this.$t('valid.noSpecial');
            let fields1 = [
                {
                    id: 'id',
                    type: 'hidden',
                },
                {
                    span: 18,
                    label: 'Name',
                    primaryTitle: 'General Settings',
                    type: 'input',
                    style: {width: '400px'},
                    id: 'name',
                    maxlength: 40,
                    rules: [
                        {required: true, message: this.$t('valid.required'), trigger: 'blur'},
                        {validator: FormUtil(this).validator.noSpecialWord, trigger: 'blur'},
                    ]
                }, {
                    span: 18,
                    label: 'Description',
                    style: {width: '400px'},
                    type: 'textarea',
                    id: 'description',
                    maxlength: 200,
                    rules: [
//                        {required: true, message: this.$t('valid.required'), trigger: 'blur'},
                    ]
                },];

            let integrationFields = [{
                span: 18,
                primaryTitle: 'Integration Settings',
                label: 'Integration Type',
                type: 'slot',
                id: 'integrationType',
                rules: [
                    {required: true, message: this.$t('valid.required')},
                ]
            }, {
                span: 18,
                label: 'Integration Name',
                style: {width: '400px'},
                type: 'slot',
                id: 'integrationName',
                rules: []
            }, {
                span: 18,
                label: 'Integration Email',
                style: {width: '400px'},
                type: 'slot',
                id: 'integrationEmail',
                rules: [
                    {required: true, message: this.$t('valid.required'), trigger: 'blur'},
                    {type: 'email', message: this.$t('valid.email'), trigger: 'blur'},
                ]
            },];

            let fields2 = [{
                span: 18,
                primaryTitle: 'Incident Settings',
                label: 'Escalation Policy',
                style: {width: '400px'},
                type: 'select',
                options: 'escalationPolicys',
                id: 'escalation_policy',
                rules: [
                    {required: true, message: this.$t('valid.required')},
                ]
            }, {
                label: 'Notification Urgency',
                id: 'incident_urgency_rule',
                style: {width: '580px'},
                span: 18,
                type: 'select',
                defaultValue: 'constant_high',
                options: 'incident_urgency_rule',
//                    rules: [
//                        {required: true, message: this.$t('valid.required'), trigger: 'blur'},
//                    ]
            }, {
                label: 'incidents timeouts',
                span: 18,
                type: 'slot',
                id: 'incidentTimeouts',
            }, {
                primaryTitle: 'Incident Behavior',
                secondaryTitle: 'Hedwig receives events from your monitoring systems and can then create incidents in different ways.',
                type: "radio",
                id: 'alert_creation',
                style: {display: 'flex', flexDirection: 'column', width: '600px'},
                options: "IncidentBehavior",
                defaultValue: "create_alerts_and_incidents",
                label: "BLANK",
            }
            ];

            let fields = fields1;
            if (!this.$route.params.id) {
                fields = _.concat(fields, integrationFields);
            }
            fields = _.concat(fields, fields2);

            const formUtil = FormUtil(this).initFields(fields);
            const dicts = {
                integrationTypes: [
//                    {value: 'tools', label: 'Select Tools'},
                    {value: 'email', label: 'Integrate via email'},
                    {value: 'api', label: 'Use our API directly'},
                    {value: 'unuse', label: 'Don\'t use an integration'},
                ],
                incident_urgency_rule: [
                    {
                        value: 'constant_high',
                        label: 'Notify responders until someone responds, escalate as needed (use high-urgency notification rules)'
                    },
                    {
                        value: 'constant_low',
                        label: 'Notify responders, do not escalate (use low-urgency notification rules)'
                    },
                ],
                escalationPolicys: [],
                IncidentBehavior: [
                    {
                        label: this.I18n('create alerts and incidents'),
                        value: 'create_alerts_and_incidents',
                        description: 'An event will create an alert and then add it to a new incident. These incidents can be merged.'
                    },
//                    {
//                        label: this.I18n('create incidents'),
//                        value: 'create_incidents',
//                        description: 'An event will create an incident that cannot be merged.'
//                    },
                ]
            }
            let formValidate =  _.assign(formUtil.forms(), {
                incidentTimeouts: [
                    'acknowledgement_timeout', 'auto_resolve_timeout'
                ],
                acknowledgement_timeout: 1800,
                auto_resolve_timeout: 14400,
            });
            return {
                dicts,
                loading: false,
                title: "Add a Service",
                editFields: formUtil.editFields(),
                formValidate: formValidate,
                ruleValidate: formUtil.rules(),
                disabled: {
                    acknowledgement_timeout: true,
                    auto_resolve_timeout: true,
                },
                button: {
                    enable: true,
                    submit: this.saveServices,
                    reset: () => {
                        this.formValidate.id = this.$route.params.id;
                    },
                    cancel: () => {
                        this.$router.push("/services")
                    }
                }
            }
        }
    }
</script>