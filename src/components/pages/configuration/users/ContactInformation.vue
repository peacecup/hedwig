<template>
    <div class="user-information"  v-if="userinfo.id && Users.me.data.id">
        <Row>
            <Col span="20" offset="1" class="fields">
            <Row type="flex">
                <Col span="4">
                <strong>Name</strong>
                </Col>
                <Col span="20">
                <EditField ref="editName" :update="saveUserInfo.bind(this,'name')"  :func="{'key':'user.edit', 'ignore': isMe}" >
                    <div slot="field-item">
                        <Input size="small" v-model="userinfo.name" maxlength="30"/>
                    </div>
                    <div slot="field-value">{{userinfo.name}}</div>
                </EditField>
                </Col>
            </Row>
            <Row type="flex">
                <Col span="4">
                <strong>Title</strong>
                </Col>
                <Col span="20">
                <EditField ref="editJobTitle" :update="saveUserInfo.bind(this,'job_title')"  :func="{'key':'user.edit', 'ignore': isMe}" >
                    <div slot="field-item">
                        <Select :filterable="true" size="small" v-model="userinfo.job_title">
                            <SelectJobTitle></SelectJobTitle>
                        </Select>
                    </div>
                    <div slot="field-value">{{userinfo.job_title}}</div>
                </EditField>
                </Col>
            </Row>
            <Row type="flex">
                <Col span="4">
                <strong>Bio</strong>
                </Col>
                <Col span="20">
                <EditField ref="editDescription" :update="saveUserInfo.bind(this,'description')"  :func="{'key':'user.edit', 'ignore': isMe}" >
                    <div slot="field-item">
                        <Input type="textarea" size="small" v-model="userinfo.description" maxlength="200"/>
                    </div>
                    <div slot="field-value">{{userinfo.description}}</div>
                </EditField>
                </Col>
            </Row>
            <Row type="flex">
                <Col span="4">
                <strong>Time Zone</strong>
                </Col>
                <Col span="20">
                <EditField ref="editTimezone" :update="saveUserInfo.bind(this,'time_zone')"  :func="{'key':'user.edit', 'ignore': isMe}" >
                    <div slot="field-item">
                        <Select :filterable="true" size="small" v-model="userinfo.time_zone">
                            <TimeZoneSelect></TimeZoneSelect>
                        </Select>
                    </div>
                    <div slot="field-value">{{userinfo.time_zone}}</div>
                </EditField>
                </Col>
            </Row>
            <Row type="flex">
                <Col span="4">
                <strong>Current Time</strong>
                </Col>
                <Col span="20">
                {{currentTime}}
                </Col>
            </Row>
            <div class="divider"></div>
            <Row type="flex">
                <Col span="4">
                <strong>Phone</strong>
                </Col>
                <Col span="20">
                <div v-for="phone in contact_methods.phone_contact_methods" :key="`phone_${phone.id || phone._id}`"
                     style="margin-bottom: 10px">
                    <EditField
                             :func="{'key':'user.edit', 'ignore': isMe}"
                            :ref="`editPhone_${phone.id || phone._id}`"
                            :edit="phone.edit"
                            :update="saveUserInfo.bind(this,'phone',phone)"
                            :remove="remove.bind(this,'phone',phone)"
                            :cancel="cancel.bind(this,'phone',phone)">
                        <div slot="field-item">
                            <Col span="10" style="padding: 0px">

                            <input class="ivu-input ivu-input-small" size="small"
                                   v-model="phone.address"
                                   oninvalid="setCustomValidity('请输入11位手机号');"
                                   oninput="setCustomValidity('')"
                                   pattern="^1(3|4|5|7|8)\d{9}$"
                                   required/>
                            </Col>
                            <Col span="10" offset="1" style="padding: 0px">
                            <Select size="small" v-model="phone.label">
                                <Option :key="label.value" :value="label.value" v-for="label in dicts.labels">
                                    {{label.label}}




                                </Option>
                            </Select>
                            </Col>
                        </div>
                        <div slot="field-value">{{phone.address}} ( {{phone.label}} ) </div>
                    </EditField>
                </div>
                <a v-key="{key:`user.edit`,ignore:isMe}" href="javascript:void(0)" @click="addPhone">
                    <Icon type="plus"></Icon>
                    Add Phone Number</a>
                </Col>
            </Row>
            <div class="divider"></div>
            <Row type="flex">
                <Col span="4">
                <strong>SMS</strong>
                </Col>
                <Col span="20">

                <div v-for="sms in contact_methods.sms_contact_methods" :key="`sms_${sms.id || sms._id}`"
                     style="margin-bottom: 10px">
                    <EditField
                             :func="{'key':'user.edit', 'ignore': isMe}"
                            :ref="`editSms_${sms.id || sms._id}`"
                            :edit="sms.edit"
                            :update="saveUserInfo.bind(this,'sms',sms)"
                            :remove="remove.bind(this,'sms',sms)"
                            :cancel="cancel.bind(this,'sms',sms)">
                        <div slot="field-item">
                            <Col span="10" style="padding: 0px">
                            <input class="ivu-input ivu-input-small" size="small" v-model="sms.address"
                                   oninvalid="setCustomValidity('请输入11位手机号');"
                                   oninput="setCustomValidity('')"
                                   pattern="^1(3|4|5|7|8)\d{9}$"
                                   required
                            />
                            </Col>
                            <Col span="10" offset="1" style="padding: 0px">
                            <Select size="small" v-model="sms.label">
                                <Option :key="label.value" :value="label.value" v-for="label in dicts.labels">
                                    {{label.label}}




                                </Option>
                            </Select>
                            </Col>
                        </div>
                        <div slot="field-value">{{sms.address}} ( {{sms.label}} )</div>
                    </EditField>
                </div>
                <a v-key="{key:`user.edit`, ignore:isMe}" href="javascript:void(0)" @click="addSms">
                    <Icon type="plus"></Icon>
                    Add SMS Number</a>
                </Col>
            </Row>
            <div class="divider"></div>
            <Row type="flex">
                <Col span="4">
                <strong>Email</strong>
                </Col>
                <Col span="20">
                <div v-for="(email, index) in contact_methods.email_contact_methods"
                     :key="`email_${email.id || email._id}`" style="margin-bottom: 10px">
                    <EditField
                             :func="{'key':'user.edit', 'ignore': isMe}"
                            :ref="`editEmail_${email._id || email.id}`"
                            :edit="email.edit"
                            :update="saveUserInfo.bind(this,'email',email)"
                            :remove="remove.bind(this,'email',email)"
                            :cancel="cancel.bind(this,'email',email)">
                        <div slot="field-item">

                            <Row>
                                <Col span="10" style="padding: 0px">
                                <input class="ivu-input ivu-input-small" size="small" v-model="email.address"
                                       type="email"
                                       required
                                />
                                </Col>
                                <Col span="10" offset="1" style="padding: 0px">
                                <Select size="small" v-model="email.label">
                                    <Option :key="label.value" :value="label.value" v-for="label in dicts.labels">
                                        {{label.label}}




                                    </Option>
                                </Select>
                                </Col>
                                <Col span="10" style="padding: 0px">
                                <Checkbox trueValue="1" falseValue="0" v-model="email.sendShortEmail">Send Short Email




                                </Checkbox>
                                <Checkbox trueValue="1" falseValue="0" v-model="email.sendHtmlEmail">Send HTML Email




                                </Checkbox>
                                </Col>
                            </Row>
                        </div>
                        <div slot="field-value">
                            <a :href="`mailto:${email.address}`">{{email.address}}</a>( {{email.label}} )
                          <!--  [{{ email.sendShortEmail === '1' ? 'Short Emails' : (email.sendHtmlEmail === '1' ? 'Html Emails' : '')}}]-->
                            {{sendEmailType(email)}}



                        </div>
                    </EditField>
                </div>
                <a v-key="{key:`user.edit`,ignore:isMe}" href="javascript:void(0)" @click="addEmail">
                    <Icon type="plus"></Icon>
                    Add Email</a>
                </Col>
            </Row>
            </Col>
            <Col span="20">
            <LogEntries :user="userinfo" :passday="14"></LogEntries>
            </Col>
        </Row>
    </div>
</template>
<script>

    import moment from 'moment';
    import {VueUtil, FormUtil} from '@util';
    import LogEntries from '../../incidents/LogEntries.vue';

    export default{
        name: 'ContactInformation',
        components: {LogEntries},
        computed: {
            ...VueUtil(this).select(['Users']).state(),
            isMe(){
                return this.userinfo.id === this.Users.me.data.id;
            }
        },
        props: ['userinfo', 'refreshContactInfo'],
        data(){
            const dicts = {
                Roles: [],
                Teams: [],
                Titles: [
                    {label: 'Developer', value: 'Developer'}
                ],
                labels: [
                    {label: 'Work', value: 'Work'},
                    {label: 'Home', value: 'Home'},
                    {label: 'Pager', value: 'Pager'},
                    {label: 'Mobile', value: 'Mobile'},
                    {label: 'Other', value: 'Other'},
                ]
            }
            return {
                dicts,
                currentTime: moment().format(this.$t('date.dateTime')),
                saveStatus: {
                    name: false,
                    title: false,
                },
                contact_methods: {
                    phone_contact_methods: [],
                    sms_contact_methods: [],
                    email_contact_methods: []
                }
            }
        },
        mounted(){
        },
        watch: {
            "Users.update": "listenUsers",
            "Users.contact_methods_list": "listenContactMethod",
            "Users.contact_methods_save": "listenContactMethod",
            "Users.contact_methods_update": "listenContactMethod",
            "Users.contact_methods_delete": "listenContactMethod",
            "userinfo": "listenUserinfo"
        },
        methods: {
            ...VueUtil(this).select(['Users', 'Services']).actions(),
            listenUserinfo(userinfo){
                if (userinfo.contact_methods) {
                    _.map(userinfo.contact_methods, (contact_method) => {
                        contact_method.label = contact_method.summary;
                    })
                    var contact_methods = _.chain(userinfo.contact_methods).groupBy((m) => m.type + 's').value();
                    this.contact_methods = {
                        phone_contact_methods: [],
                        sms_contact_methods: [],
                        email_contact_methods: [],
                        ...contact_methods,
                    }
                }

            },
            listenContactMethod(data){

                VueUtil(this).cb(data).success(() => {
                    this.$emit('refreshContactInfo');
                }).error();
            },
            listenUsers(data){
                VueUtil(this).cb(data).success().error();
            },
            saveUserInfo(field, target){
                switch (field) {
                    case 'name':
                        if (_.trim(this.userinfo.name) === '') {
                            this.$Message.error('name is not null!');
                            return;
                        } else {
                            this.$refs['editName'].cb();
                        }
                        break;
                    case 'job_title':
                        this.$refs['editJobTitle'].cb();
                        break;
                    case 'description':
                        this.$refs['editDescription'].cb();
                        break;
                    case 'time_zone':
                        this.$refs['editTimezone'].cb();
                        break;
                    case 'email':
                        this.$refs[`editEmail_${target._id || target.id}`][0].cb();
                        this.saveContactMethods(target);
                        return;
                    case 'sms':
                        this.$refs[`editSms_${target._id || target.id}`][0].cb();
                        this.saveContactMethods(target);
                        return;
                    case 'phone':
                        this.$refs[`editPhone_${target._id || target.id}`][0].cb();
                        this.saveContactMethods(target);
                        return;
                }
                VueUtil(this).select("Users").update(this.userinfo);
            },
            saveContactMethods(target){
                if (target.id) {
                    VueUtil(this).select("Users").action("contact_methods_update", {
                        userId: this.userinfo.id,
                        ...target,
                    });
                } else {
                    target.loading = true;
                    VueUtil(this).select("Users").action("contact_methods_save", {
                        userId: this.userinfo.id,
                        ...target,
                    });
                }
            },
            remove(type, target){
                if (target.id) {
                    VueUtil(this).select('Users').action('contact_methods_delete', {
                        id: target.id,
                        userId: this.userinfo.id,
                    });
                } else {
                    _.keys(this.contact_methods).map(key => {
                        this.contact_methods[key] = _.chain(this.contact_methods[key]).remove(item => {
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
            addPhone(){
                this.contact_methods.phone_contact_methods.push({
                    _id: VueUtil(this).guid(),
                    edit: true,
                    address: '',
                    label: 'Work',
                    type: 'phone_contact_method',
                    sendShortEmail: null,
                    sendHtmlEmail: null,
                })
            },
            addSms(){
                this.contact_methods.sms_contact_methods.push({
                    _id: VueUtil(this).guid(),
                    edit: true,
                    address: '',
                    label: 'Work',
                    type: 'sms_contact_method',
                    sendShortEmail: null,
                    sendHtmlEmail: null,
                })
            },
            addEmail(){
                this.contact_methods.email_contact_methods.push({
                    _id: VueUtil(this).guid(),
                    edit: true,
                    address: '',
                    label: 'Work',
                    sendShortEmail: '1',
                    sendHtmlEmail: '0',
                    type: 'email_contact_method',
                })
            },
            sendEmailType(email){
                if(email.sendShortEmail === '1'){
                    return '[ Short Emails ]';
                }else if(email.sendHtmlEmail === '1'){
                    return '[ Html Emails ]'
                }else{
                    return '';
                }
            }
        }
    }
</script>