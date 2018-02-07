<template>
    <Row v-pageKey="{key:['service.new_eventRule','service.edit_eventRule'],ignore:permission}">
        <Col span="20">
        <h2>{{I18n('create event rule')}}</h2>
        <p>
            Events are processed sequentially by these rules and stop processing after the first successful match. Re-order the rules by dragging and dropping them in a different order.</p>
        </Col>
        <Col span="24">
        <Card>
            <div slot="title">If the following condition is met</div>
            <div>
                <Row>
                    <Col span="4">
                    <Select placeholder="Select an event field" v-model="eventRule.predicateSubject"
                            @on-change="predicateSubjectChange">
                        <Option v-for=" op in dict.predicateSubjects" :value="op.value" :key="op.value">{{op.label}}

                        </Option>
                    </Select>
                    </Col>
                    <Col span="4" v-if="predicateSubjectDetailsShow">
                    <Input placeholder="key name in details" v-model="eventRule.keyname"/>
                    </Col>
                    <Col span="4">
                    <Select @on-change="predicateTypeChange" v-model="eventRule.predicateType">
                        <Option v-for=" op in dict.predicateTypes" :value="op.value" :key="op.value">{{op.label}}

                        </Option>
                    </Select>
                    </Col>
                    <Col span="4">
                    <Input :maxlength="50" v-if="predicateValueShow" placeholder="Value"
                           v-model="eventRule.predicateValue"></Input>
                    </Col>
                </Row>
            </div>
        </Card>

        </Col>

        <Col span="24">
        <Card>
            <div slot="title">Then perform the following actions</div>
            <div>
                <Row v-for="(action,index) in eventRule.eventRuleActions" :key="action._id || action.id">
                    <Col span="6">
                    <Select @on-change="actionFieldChange" v-model="action.field">
                        <Option value="suppress">Suppress</Option>
                        <Option value="set_severity">Set severity</Option>
                    </Select>
                    </Col>
                    <Col span="6">
                    <div v-if="action.field === 'set_severity'">
                        to
                        <Select style="width:200px;" placeholder="Select adjusted severity" v-model="action.value">
                        <Option value="critical">Critical</Option>
                        <Option value="error">Error</Option>
                        <Option value="warning">Warning</Option>
                        <Option value="info">Info</Option>
                    </Select>
                    </div>
                    </Col>
                    <Col span="11" class="text-align-right">
                    <a href="javascript:void(0)" @click="removeAction(index)"
                       v-if="eventRule.eventRuleActions.length > 1">
                        <Icon type="close"></Icon>
                        Remove action</a>
                    </Col>
                </Row>
                <a href="javascript:void(0)" @click="addAction" v-if="eventRule.eventRuleActions.length === 1">
                    <Icon type="plus"></Icon>
                    Add another action</a>
                <a href="javascript:void(0)" disabled="true" v-if="eventRule.eventRuleActions.length !== 1">
                    <Icon type="plus"></Icon>
                    No more available actions</a>
            </div>
        </Card>
        </Col>
        <Col span="24">
        <Button type="success" @click="saveEventRule" :disabled="!validate">{{ I18n('save event rule') }}</Button>
        <Button @click="cancel">{{ $t('button.cancel')}}</Button>
        </Col>
    </Row>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil, PermissionUtil} from '@util';

    export default{
        name: 'EventRulesEdit',
        components: {},
        computed: {
            ...VueUtil(this).select(['Services']).state(),
            permission(){
                return PermissionUtil.service.isManager({id: this.$route.params.serviceId})
            }
        },
        props: {},

        data(){

            let dict = {
                predicateSubjects: [
                    {value: "event_class", label: "Class"},
                    {value: "source_component", label: "Component"},
                    {value: "service_group", label: "Group"},
                    {value: "source_location", label: "Location"},
                    {value: "severity", label: "Severity"},
                    {value: "source_origin", label: "Source"},
                    {value: "description", label: " Summary"},
                    {value: "details", label: " Custom Details"},
                ],
                predicateTypes: [
                    {value: "contains", label: "contains"},
                    {value: "equals", label: "equals"},
                    {value: "exists", label: "exists"},
                    {value: "matches", label: "matches the regex"},
                    {value: "not_contains", label: "does not contain"},
                    {value: "not_equals", label: "does not equal"},
                    {value: "not_exists", label: "does not exist"},
                    {value: "not_matches", label: " does not match the regex"},
                ]
            }

            return {
                dict,
                validate: false,
                predicateValueShow: true,
                predicateSubjectDetailsShow: false,
                eventRule: {
                    id: null,
                    predicateSubject: null,
                    keyname: null,
                    predicateType: null,
                    predicateValue: null,
                    eventRuleActions: [
                        {type: null, field: null, value: null}
                    ]
                }
            }
        },
        mounted(){
            if (this.$route.params.id) {
                VueUtil(this).select("Services").action("event_rules_get", {
                    id: this.$route.params.id,
                    serviceId: this.$route.params.serviceId,
                });
            }
        },
        watch: {
            "eventRule": {
                handler: "listenValidate",
                deep: true
            },
            "Services.event_rules_save": "listenEventRule",
            "Services.event_rules_update": "listenEventRule",
            "Services.event_rules_get": "listenEventRule"
        },
        methods: {
            ...VueUtil(this).select(['Services']).actions(),
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            addAction(){
                this.eventRule.eventRuleActions.push({
                    _id: VueUtil(this).guid(),
                    type: null, field: null, value: null
                });
            },
            predicateTypeChange(predicateType){
                if (predicateType === 'exists' || predicateType === 'not_exists') {
                    this.predicateValueShow = false;
                } else {
                    this.predicateValueShow = true;
                }
            },
            predicateSubjectChange(predicateSubject){
                if (predicateSubject === 'details') {
                    this.predicateSubjectDetailsShow = true;
                } else {
                    this.predicateSubjectDetailsShow = false;
                    this.eventRule.keyname = null;
                }
            },
            cancel(){
                this.$router.push(`/services/${this.$route.params.serviceId}/detail/EventRules`);
            },
            removeAction(index){
                this.eventRule.eventRuleActions = [this.eventRule.eventRuleActions[Math.abs(index - 1)]];
            },
            actionFieldChange(field, e){
//                console.log(field, e)
            },
            saveEventRule(){
                if (!!this.eventRule.id) {
                    VueUtil(this).select("Services").action("event_rules_update", {
                        ...this.eventRule,
                        serviceId: this.$route.params.serviceId,
                        service: {id: this.$route.params.serviceId},
                    }, this.beforeSave);
                } else {
                    VueUtil(this).select("Services").action("event_rules_save", {
                        ...this.eventRule,
                        serviceId: this.$route.params.serviceId,
                        service: {id: this.$route.params.serviceId},
                    }, this.beforeSave);
                }
            },
            beforeSave(eventRule){
                if (eventRule.keyname) {
                    eventRule.predicateSubject = eventRule.keyname;
                }
                return eventRule;
            },
            listenEventRule(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'event_rules_save' || data.type === 'event_rules_update') {
                        this.$Message.success(`save success!`);
                        setTimeout(this.cancel, 600);
                    } else if (data.type === 'event_rules_get') {
                        let keyname = null;
                        if (!_.includes(_.chain(this.dict.predicateSubjects).map(p => p.value).filter(v => v !== 'details').value(), data.data.predicateSubject)) {
                            keyname = data.data.predicateSubject;
                            data.data.predicateSubject = 'details';
                            this.predicateSubjectDetailsShow = true;
                        }
                        this.eventRule = {
                            ...data.data,
                            keyname,
                        };
                    }
                }).error();
            },
            listenValidate({predicateSubject, keyname = null, predicateType, predicateValue, eventRuleActions}){
                let validate = true;

                if (predicateSubject === null || predicateType === null) {
                    validate = false;
                }

                if (predicateSubject === 'details' && (keyname === null || keyname === '')) {
                    validate = false;
                }

                if (predicateType !== 'exists' && predicateType !== 'not_exists') {
                    if (predicateValue === null || predicateValue === '') {
                        validate = false;
                    }
                }
                _.forEach(eventRuleActions, action => {
                    if (action.field === null) {
                        validate = false;
                    } else if (action.field === 'set_severity' && action.value === null) {
                        validate = false;
                    }
                })
                if (eventRuleActions.length === 2) {
                    if (eventRuleActions[0].field === eventRuleActions[1].field) {
                        validate = false;
                    }
                }
                this.validate = validate;
            }
        }
    }
</script>