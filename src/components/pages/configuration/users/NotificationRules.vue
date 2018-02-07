<template>
    <div class="notification-rules" v-if="userinfo.id && Users.me.data.id">
        <Row>
            <Row style="width: 100%;border-bottom: 1px solid #e9eaec">
                <Col span="24">
                <h2>When someone requests me as a responder...</h2>
                <p>
                    Notify me immediately using the first contact method of each type in my high-urgency notification rules. (Distinct types include phone, SMS, email, push for iOS, and push for Android.)</p>
                <Alert>
                    Any person responding to an open incident may request you to join the response. To learn more, read our guide to adding responders.
                </Alert>
                </Col>
            </Row>
            <Col span="24">
            <h2>When a high-urgency incident is assigned to me...</h2>
            <Alert type="warning">
                We strongly recommend adding phone and SMS notification rules to reduce the chance of missing a notification.
            </Alert>
            <Alert type="warning">
                Configuring several notification rules is the best way to make sure you never miss a notification.
            </Alert>


            <div v-for="high in rules.high" style="margin-bottom: 10px">
                <EditField
                        :func="{'key':'user.edit', 'ignore': isMe}"
                        :ref="`high_${high._id || high.id}`"
                        :edit="high.edit"
                        :update="saveRules.bind(this,'high',high)"
                        :remove="remove.bind(this,'high',high)"
                        :cancel="cancel.bind(this,'high',high)"
                        :copy="copy.bind(this,'high',high)">
                    <div slot="field-item">
                        <Col span="24" style="padding: 0px">
                        minutes


                        <InputNumber :min="0" style="width: 50px;" size="small" v-model="high.start_delay_in_minutes"/>
                        after an incident is assigned to me, contact me via
                       <Select style="width: 220px;" size="small" v-model="high.contact_method.id">
                        <OptionGroup v-for="(value, key, index) in dicts.vias" :label="key" :key="key">
                            <Option :value="label.value" :key="label.value" v-for="label in value">{{label.label}}

                            </Option>
                        </OptionGroup>

                    </Select>

                        </Col>
                    </div>
                    <div slot="field-value">
                        <Icon type="android-mail"></Icon>
                        <strong>{{high.start_delay_in_minutes === 0 ? "Immediately" : (high.start_delay_in_minutes + "minutes" )}}</strong>
                        after it's assigned to me, short {{_.get(high, 'contact_method.type')}} me at {{_.get(high, 'contact_method.address')}}

                    </div>
                </EditField>
            </div>


            <a v-key="{'key':'user.edit', 'ignore': isMe}" href="javascript:void(0)"
               @click="add('high')">
                <Icon type="plus"></Icon>
                Add Notification Rule</a>
            </Col>
            <Col span="24">
            <div class="divider"></div>
            <h2>When any of my high-urgency incidents change...</h2>

            <div v-for="incidentChanged in rules.incidentChanged" style="margin-bottom: 10px">
                <EditField
                        :func="{'key':'user.edit', 'ignore': isMe}"
                        :ref="`incidentChanged_${incidentChanged._id || incidentChanged.id}`"
                        :edit="incidentChanged.edit"
                        :update="saveRules.bind(this,'incidentChanged',incidentChanged)"
                        :remove="remove.bind(this,'incidentChanged',incidentChanged)"
                        :cancel="cancel.bind(this,'incidentChanged',incidentChanged)"
                        :copy="copy.bind(this,'incidentChanged',incidentChanged)">
                    <div slot="field-item">
                        <Col span="24" style="padding: 0px">
                        When any of my incidents are
                         <Select style="width: 100px;" size="small" v-model="incidentChanged.status">
                        <Option :key="label.value" :value="label.value" v-for="label in dicts.incidentsStatus">
                            {{label.label}}
                        </Option>
                    </Select>
                        contact me via
                        <Select style="width: 220px;" size="small" v-model="incidentChanged.contact_method.id">
                        <OptionGroup v-for="(value, key, index) in dicts.vias" :label="key" :key="key">
                            <Option :value="label.value" :key="label.value" v-for="label in value">{{label.label}}

                            </Option>
                        </OptionGroup>
                    </Select>

                        </Col>
                    </div>
                    <div slot="field-value">
                        When any of my incidents are <strong>{{incidentChanged.status}}</strong>
                        short {{_.get(incidentChanged, 'contact_method.type')}} me at {{_.get(incidentChanged, 'contact_method.address')}}

                    </div>
                </EditField>
            </div>

            <a v-key="{'key':'user.edit', 'ignore': isMe}" href="javascript:void(0)"
               @click="add('incidentChanged')"
            >
                <Icon type="plus"></Icon>
                Add Status Update Rule</a>

            </Col>
            <Col span="24">
            <div class="divider"></div>
            <h2>When a low-urgency incident is assigned to me...</h2>

            <div v-for="low in rules.low" style="margin-bottom: 10px">
                <EditField
                        :func="{'key':'user.edit', 'ignore': isMe}"
                        :ref="`low_${low._id || low.id}`"
                        :edit="low.edit"
                        :update="saveRules.bind(this,'low',low)"
                        :remove="remove.bind(this,'low',low)"
                        :cancel="cancel.bind(this,'low',low)"
                        :copy="copy.bind(this,'low',low)">
                    <div slot="field-item">
                        <Col span="24" style="padding: 0px">
                        minutes
                        <InputNumber :min="0" style="width: 50px;" size="small" v-model="low.start_delay_in_minutes"/>
                        after an incident is assigned to me, contact me via
                        <Select style="width: 220px;" size="small" v-model="low.contact_method.id">
                        <OptionGroup v-for="(value, key, index) in dicts.vias" :label="key" :key="key">
                            <Option :value="label.value" :key="label.value" v-for="label in value">{{label.label}}

                            </Option>
                        </OptionGroup>
                    </Select>

                        </Col>
                    </div>
                    <div slot="field-value">
                        <Icon type="android-mail"></Icon>
                        <strong>{{low.start_delay_in_minutes === 0 ? "Immediately" : (low.start_delay_in_minutes + "minutes" )}}</strong>
                        after it's assigned to me, short {{_.get(low, 'contact_method.type')}} me at {{_.get(low, 'contact_method.address')}}

                    </div>
                </EditField>
            </div>


            <a v-key="{key:`user.edit`,ignore: isMe}" href="javascript:void(0)"
               @click="add('low')"
            >
                <Icon type="plus"></Icon>
                Add Notification Rule</a>

            </Col>
            <Col span="24">
            <div class="divider"></div>
            <h2>Before I go on-call or off-call...</h2>


            <div v-for="oncallHandoff in rules.oncallHandoff" style="margin-bottom: 10px">
                <EditField
                        :func="{'key':'user.edit', 'ignore': isMe}"
                        :ref="`oncallHandoff_${oncallHandoff._id || oncallHandoff.id}`"
                        :edit="oncallHandoff.edit"
                        :update="saveRules.bind(this,'oncallHandoff',oncallHandoff)"
                        :remove="remove.bind(this,'oncallHandoff',oncallHandoff)"
                        :cancel="cancel.bind(this,'oncallHandoff',oncallHandoff)">
                    <div slot="field-item">
                        <Col span="24" style="padding: 0px">
                        <InputNumber :max="48" :min="0" style="width: 50px;" size="small"
                                     v-model="oncallHandoff.notify_advance_in_minutes"/>
                        hours before I go
                        <Select style="width: 200px;" size="small" v-model="oncallHandoff.handoff_type">
                        <Option :key="label.value" :value="label.value" v-for="label in dicts.onCallType">{{label.label}}</Option>
                    </Select>
                        contact me via
                      <Select style="width: 220px;" size="small" v-model="oncallHandoff.contact_method.id">
                        <OptionGroup v-for="(value, key, index) in dicts.vias" :label="key" :key="key">
                            <Option :value="label.value" :key="label.value" v-for="label in value">{{label.label}}

                            </Option>
                        </OptionGroup>
                    </Select>

                        </Col>
                    </div>
                    <div slot="field-value">
                        <Icon type="android-mail"></Icon>
                        <strong>
                          {{oncallHandoff.notify_advance_in_minutes === 0 ? "Immediately":timeTransformer(oncallHandoff.notify_advance_in_minutes)}} </strong>
                        before I <strong>{{oncallHandoff.handoff_type}}</strong>, short {{_.get(oncallHandoff, 'contact_method.type')}} me at {{_.get(oncallHandoff, 'contact_method.address')}}

                    </div>
                </EditField>
            </div>


            <a v-key="{key:`user.edit`,ignore: isMe}" href="javascript:void(0)"
               @click="add('oncallHandoff')"
            >
                <Icon type="plus"></Icon>
                Add On-Call Handoff Notification Rule </a>
            </Col>


        </Row>
    </div>
</template>

<script>

    import {VueUtil, FormUtil} from '@util';

    export default{
        name: "NotificationRules",
        components: {},
        computed: {
            ...VueUtil(this).select(['Users']).state(),
            isMe(){
                return this.userinfo.id === this.Users.me.data.id;
            }
        },
        props: {
            userinfo: {
                type: Object,
            }
        },

        data(){
            let dicts = {
                incidentsStatus: [
                    {

                        label: "resolved",
                        value: "resolved",
                    },
                    {

                        label: "acknowlaged",
                        value: "acknowlaged",
                    },
                    {

                        label: "escaleted",
                        value: "escaleted",
                    }
                ],
                onCallType: [
                    {
                        value: "on_call_or_off_call",
                        label: "On-Call or Off-Call",
                    }, {
                        value: "on_call",
                        label: "On-Call",
                    }, {
                        value: "off_call",
                        label: "Off-Call",
                    },
                ]
            }
            return {
                dicts,
                rules: {
                    high: [],
                    incidentChanged: [],
                    low: [],
                    oncallHandoff: [],
                }
            }
        },
        mounted(){

        },
        watch: {
            "userinfo": "listenUserinfo",

            "Users.notification_rules_list": "listenUsers",
            "Users.notification_rules_delete": "listenNotificationRules",
            "Users.notification_rules_save": "listenNotificationRules",
            "Users.notification_rules_update": "listenNotificationRules",

            "Users.incident_status_change_rules_list": "listenUsers",
            "Users.incident_status_change_rules_delete": "listenNotificationRules",
            "Users.incident_status_change_rules_save": "listenNotificationRules",
            "Users.incident_status_change_rules_update": "listenNotificationRules",

            "Users.oncall_handoff_rules_list": "listenUsers",
            "Users.oncall_handoff_rules_delete": "listenNotificationRules",
            "Users.oncall_handoff_rules_save": "listenNotificationRules",
            "Users.oncall_handoff_rules_update": "listenNotificationRules"

        },
        methods: {
            ...VueUtil(this).select(['Users']).actions(),
            listenUserinfo(userinfo){
                VueUtil(this).select('Users')
                    .action('notification_rules_list', {userId: userinfo.id, include: ["contact_methods"]})
                    .action('incident_status_change_rules_list', {userId: userinfo.id, include: ["contact_methods"]})
                    .action('oncall_handoff_rules_list', {userId: userinfo.id, include: ["contact_methods"]});
                     
                    var contact_methods=_.cloneDeep(userinfo.contact_methods)
                    this.dicts.vias = _.chain(contact_methods).map(item => {
                        if(item.type === 'email_contact_method'){
                            item.type = 'email';
                        }
                        if(item.type === 'phone_contact_method'){
                            item.type = 'phone';
                        }
                        if(item.type === 'sms_contact_method'){
                            item.type = 'sms';
                        }
                            return {
                                value: item.id,
                                label: `${item.address}(${item.label})`,
                                type: item.type
                            }
                        }).groupBy(item => item.type).value();
            },
            listenNotificationRules(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type.indexOf('notification_rules')>=0) {
                        VueUtil(this).select('Users').action('notification_rules_list', {
                            userId: this.userinfo.id,
                            include: ["contact_methods"]
                        });
                    } else if (data.type.indexOf('incident_status_change_rules')>=0) {    
                        VueUtil(this).select('Users').action('incident_status_change_rules_list', {
                            userId: this.userinfo.id,
                            include: ["contact_methods"]
                        });
                    } else if (data.type.indexOf('oncall_handoff_rules')>=0) {
                        VueUtil(this).select('Users').action('oncall_handoff_rules_list', {
                            userId: this.userinfo.id,
                            include: ["contact_methods"]
                        });
                    }
                })
            },
            listenUsers(data){
                VueUtil(this).cb(data).success(() => {
                   if (data.type === 'notification_rules_list') {
                        this.rules = _.assign(this.rules, {
                            ..._.chain(this.Users.notification_rules_list.data.list).groupBy(item => item.urgency).value(),
                        })

                    } else if (data.type === 'incident_status_change_rules_list') {
                        this.rules = _.assign(this.rules, {
                            incidentChanged: _.get(this.Users, 'incident_status_change_rules_list.data.list', []),
                        })

                    } else if (data.type === 'oncall_handoff_rules_list') {
                        this.rules = _.assign(this.rules, {
                            oncallHandoff: _.get(this.Users, 'oncall_handoff_rules_list.data.list', [])
                        });
                        _.map(this.rules.oncallHandoff,rule=>{
                            rule.notify_advance_in_minutes=rule.notify_advance_in_minutes/60;
                        });

                    }
                })
            },
            add(type){
                switch (type) {
                    case 'high':
                        this.rules.high.push({
                            start_delay_in_minutes: 0,
                            contact_method: {id: this.dicts.vias["email"][0].value},
                            edit: true,
                            urgency: 'high',
                            _id: VueUtil(this).guid()
                        });
                        break;
                    case 'incidentChanged':
                        this.rules.incidentChanged.push({
                            status: 'resolved',
                            contact_method: {id: this.dicts.vias["email"][0].value},
                            edit: true,
                            _id: VueUtil(this).guid()
                        });
                        break;
                    case 'low':
                        this.rules.low.push({
                            start_delay_in_minutes: 0,
                            contact_method: {id: this.dicts.vias["email"][0].value},
                            edit: true,
                            urgency: 'low',
                            _id: VueUtil(this).guid()
                        });
                        break;
                    case 'oncallHandoff':
                        this.rules.oncallHandoff.push({
                            notify_advance_in_minutes: 0,
                            contact_method: {id: this.dicts.vias["email"][0].value},
                            handoff_type: 'On-Call or Off-Call',
                            edit: true,
                            _id: VueUtil(this).guid()
                        });
                        break;
                }
            },
            saveRules(type, target){
                if (target.id) {
                   this.saveNewRule(type,target);

                } else {
                   this.updateRule(type,target);
                }
                this.$refs[`${type}_${target._id || target.id}`][0].cb();
            },
            saveNewRule(type,target){
                 if (type == "high" || type == "low") {
                        VueUtil(this).select("Users").action("notification_rules_update", {
                            userId: this.userinfo.id,
                            ...target,
                        }, (data) => {
                            data.contact_method = data.contact_method
                            return data;
                        });
                    }
                    if (type == "incidentChanged") {
                        VueUtil(this).select("Users").action("incident_status_change_rules_update", {
                            userId: this.userinfo.id,
                            ...target,
                        }, (data) => {
                            data.contact_method = data.contact_method
                            return data;
                        });
                    }
                    if (type == "oncallHandoff") {
                        target.notify_advance_in_minutes=target.notify_advance_in_minutes*60;
                        if(target.notify_advance_in_minutes%1!=0){
                            this.$Message.error(`Invalid Input Provided: Notify advance in minutes must be a Integer!`);
                            return;
                        }
                        VueUtil(this).select("Users").action("oncall_handoff_rules_update", {
                            userId: this.userinfo.id,
                            ...target,
                        }, (data) => {
                            data.contact_method = data.contact_method
                            return data;
                        });
                    }
            },
            updateRule(type,target){
                 target.loading = true;
                    if (type == "high" || type == "low") {
                        VueUtil(this).select("Users").action("notification_rules_save", {
                            userId: this.userinfo.id,
                            ...target,
                        }, (data) => {
                            data.contact_method = data.contact_method
                            return data;
                        });
                    }
                    if (type == "incidentChanged") {
                        VueUtil(this).select("Users").action("incident_status_change_rules_save", {
                            userId: this.userinfo.id,
                            ...target,
                        }, (data) => {
                            data.contact_method = data.contact_method
                            return data;
                        });
                    }
                    if (type == "oncallHandoff") {
                        target.notify_advance_in_minutes=target.notify_advance_in_minutes*60;
                        if(target.notify_advance_in_minutes%1!=0){
                            this.$Message.error(`Invalid Input Provided: Notify advance in minutes must be a Integer!`);
                            return;
                        }
                        VueUtil(this).select("Users").action("oncall_handoff_rules_save", {
                            userId: this.userinfo.id,
                            ...target,
                        }, (data) => {
                            data.contact_method = data.contact_method
                            return data;
                        });
                    }
            },
            copy(type, target){
                switch (type) {
                    case 'high':
                        this.rules.high.push({
                            start_delay_in_minutes: target.start_delay_in_minutes + 5,
                            contact_method: target.contact_method,
                            edit: true,
                            urgency: 'high',
                            _id: VueUtil(this).guid()
                        });
                        break;
                    case 'incidentChanged':
                        this.rules.incidentChanged.push({
                            status: target.status,
                            contact_method: target.contact_method,
                            edit: true,
                            _id: VueUtil(this).guid()
                        });
                        break;
                    case 'low':
                        this.rules.low.push({
                            start_delay_in_minutes: target.start_delay_in_minutes + 5,
                            contact_method: target.contact_method,
                            edit: true,
                            urgency: 'low',
                            _id: VueUtil(this).guid()
                        });
                        break;

                }
            },
            remove(type, target){
                if (target.id) {
                    if (type == "high" || type == "low") {
                        VueUtil(this).select('Users').action('notification_rules_delete', {
                            userId: this.userinfo.id,
                            id: target.id,
                        })
                    }
                    if (type == "incidentChanged") {
                        VueUtil(this).select('Users').action('incident_status_change_rules_delete', {
                            userId: this.userinfo.id,
                            id: target.id,
                        })
                    }
                    if (type == "oncallHandoff") {
                        VueUtil(this).select('Users').action('oncall_handoff_rules_delete', {
                            userId: this.userinfo.id,
                            id: target.id,
                        })
                    }
                } else {
                    _.keys(this.rules).map(key => {
                        this.rules[key] = _.chain(this.rules[key]).remove(item => {
                            return item._id !== target._id;
                        }).value();
                    })
                }
            },
            cancel(type, target){
                if (!!target._id) {
                    this.remove(type, target);
                }
            },
            timeTransformer(timeToTransform){
                timeToTransform=timeToTransform*60;
                var dayUnit;
                var hourUnit;
                var day=Math.floor(timeToTransform/1440);
                var minute=timeToTransform-day*1440;
                var hour=Math.floor(minute/60);
                minute=minute-hour*60;
                if(day){
                    dayUnit=day>1?"days":"day";
                }
                if(hour){
                    hourUnit=hour>1?"hours":"hour";
                }
                if(dayUnit){
                    if(hourUnit){
                        return day+" "+dayUnit+" "+hour+" "+hourUnit;
                    }else if(minute>0){
                        return day+" "+dayUnit+" "+minute+" "+"minutes";
                    }
                } else if(hourUnit){
                    if(minute>0){
                        return hour+" "+hourUnit+" "+minute+" "+"minutes";
                    }else {
                        return  hour+" "+hourUnit;
                    }
                } else if(minute>0){
                    return minute+" "+"minutes";
                }
            }
        }
    }
</script>