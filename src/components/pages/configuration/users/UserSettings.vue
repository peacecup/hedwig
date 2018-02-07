<template>
    <div class="user-settings" style="position: relative;" v-if="userinfo.id && Users.me.data.id">
        <Row type="flex">
            <Col span="20" offset="1">
            <Row type="flex">
                <Col span="4">
                <strong>Login Email</strong>
                </Col>
                <Col span="20">
                <EditField :func="{'key':['user.edit'], 'ignore': isMe}" ref="editEmail" :update="saveUserInfo.bind(this,'email')">
                    <div slot="field-item">
                        <Input size="small" v-model="userinfo.email" />
                    </div>
                    <div slot="field-value">
                        {{userinfo.email}}
                    </div>
                </EditField>
                </Col>
                <Col span="4" v-key="{'key':'refuse', 'ignore': isMe}">
                <strong> Password</strong>
                </Col>
                <Col span="20" v-key="{'key':'refuse', 'ignore': isMe}" >
                <EditField :func="{'key':'user.edit', 'ignore': isMe}" ref="editPassword" :update="saveUserInfo.bind(this,'password')">
                    <div slot="field-item">
                        <p> password:
                            <Input type="password" size="small" v-model="userinfo.password" autofocus/>
                        </p>
                        <p> new password:
                            <Input type="password" size="small" v-model="userinfo.new_password" />
                        </p>
                        <p> confirm password:
                            <Input type="password" size="small" v-model="userinfo.confirm_password" />
                        </p>
                    </div>
                    <div slot="field-value">
                        <a href="javascript:void(0)" @click="changePassword">Change Password ...</a>
                    </div>
                </EditField>
                </Col>
                <Col span="4">
                <strong> Role </strong>
                </Col>
                <Col span="20">
                <span>{{userinfo.role}}</span>
                </Col>
                <div v-key="{'key':['user.user_setting'], 'ignore': isMe}">
                    <Col span="4">
                    <strong> Schedule Color</strong>
                    </Col>
                    <Col span="20">
                    <EditField ref="editColor" :update="saveUserInfo.bind(this,'color')">
                        <div slot="field-item">
                            <ColorPicker :recommend="true" size="small" v-model="userinfo.color" />
                        </div>
                        <div slot="field-value">
                            <div :style="`margin:2px;width:14px;height:14px;background:${userinfo.color};`"></div>
                        </div>
                    </EditField>
                    </Col>
                    <Row>
                    <Col span="4">
                    <strong> Calendar</strong>
                    </Col>
                    <Col span="20">
                    </Col>
                    </Row>
                    <Row>
                    <Col span="4">
                    <strong> Photo</strong>
                    </Col>
                    <Col span="20">
                    </Col>
                    </Row>
                    <Row>
                    <Col span="4">
                    <strong> API Access</strong>
                    </Col>
                    <Col span="20">
                    <p>API User Tokens provide an API client with the same permissions as a user. For more information about authenticating using an API User Token, please consult our developer site.</p>
                    <div>
                        <Button type="success" @click="openCreateApi">Create API User Token</Button>
                    </div>
                    </Col>
                    </Row>
                    <Row>
                    <Col span="4"></Col>
                    <Col span="20">
                    <Table v-if="APIAccess.list.data.list && APIAccess.list.data.list.length > 0" size="small" :columns="columns" :data="APIAccess.list.data.list"></Table>
                    </Col>
                    </Row>
                </div>
            </Row>
            </Col>
        </Row>
        <APIAccessEditForm ref="APIAccessEditForm" :users="user"></APIAccessEditForm>
    </div>
</template>
<script>

import ChangePassword from './ChangePassword.vue';
import { VueUtil, FormUtil } from '@util';
import APIAccessEditForm from '../apiaccess/APIAccessEditForm.vue';
import DropMenuDecorator from '@common/DropMenuDecorator.vue';


export default {
    components: {
        ChangePassword,
        APIAccessEditForm
    },
    computed: {
        ...VueUtil(this).select(['Users', 'APIAccess']).state(),
        isMe(){
            return this.userinfo.id === this.Users.me.data.id;
        }
    },
    props: {
        userinfo: {}
    },

    data() {
        const fields = [{
                id: 'id',
                type: 'hidden',
            }, {
                label: 'API Key',
                id: 'apiTokenKey'

            },
            {
                label: 'Description',
                id: 'description',
            },
            {
                label: 'Created',
                id: 'createTime',
            }, {
                label: 'Last Used',
                id: 'lastUseTime',
                render: (h, params) => {
                    var userTime = params.lastUseTime || 'Never'
                    return h('p', userTime);
                }
            }, {
                label: '',
                render: (h, params) => {
                    var keyState = "enabled";
                    if (params.row.keyState==="enabled") {
                        keyState = "disabled";
                        
                    }
                    return h('div', [
                            h('a', {
                                on: {
                                    click: () => {
                                        this.$Modal.confirm({
                                            title: 'Confirm',
                                            content: '<p>Are you sure you want to disable this API Token?<br></p>Incidents from monitoring tools connecting to this integration will no longer be created.',
                                            onOk: () => {
                                                VueUtil(this).select('APIAccess').update({
                                                    id: params.row.id,
                                                    keyState: keyState
                                                })
                                            }
                                        });
                                    }
                                }
                            }, keyState),
                            h('br', {}),
                            h('a', {
                                on: {
                                    click: () => {
                                        this.$Modal.confirm({
                                            title: 'Confirm',
                                            content: '<p>Are you sure?Any script using this key will no longer be able to connect to Hedwing!</p>',
                                            onOk: () => {
                                                VueUtil(this).select('APIAccess').delete({
                                                    id: params.row.id
                                                })
                                            }
                                        });
                                    }
                                }

                            }, 'remove')
                        ]

                    )
                }

            }
        ];

        const formUtil = FormUtil(this);
        formUtil.fields(fields);

       
        return {
            columns: [
                ...formUtil.columns()
            ],
            user:"form_user_page"
        }
    },
    mounted() {
        VueUtil(this).select('APIAccess').action('list',{
        userId:this.$route.params.id
        });
    },
    watch: {
        'APIAccess.update': 'listenAPIAccess',
        'APIAccess.delete': 'listenAPIAccess',
        'Users.update_password':'listenUsers'
    },
    methods: {
        ...VueUtil(this).select(['Users', 'APIAccess']).actions(),
        openCreateApi() {
            this.$refs['APIAccessEditForm'].setModal(true);
        },
        listenAPIAccess(data) {
             VueUtil(this).cb(data).success(() => {
                this.$Message.success(`${data.type} success!`);
                 VueUtil(this).select('APIAccess').action('list',{
                    userId:this.$route.params.id
                });
            }).error();
          
        },
        listenUsers(data) {
             VueUtil(this).cb(data).success(() => {
                    this.$Message.success(`${data.type} success!`);
                }).error(()=>{
                    if(data.type==="update_password"){
                        this.$refs['editPassword'].isEdit = true;

                    }
                    return true;

                }
                );
        },
        changePassword() {
            this.$refs['editPassword'].isEdit = true;
        },
        saveUserInfo(type, target) {
            switch (type) {
                case "email":
                    this.$refs['editEmail'].cb();
                    break;
                case "password":
                //修改密码需要使用单独的update方法，与用户信息update方法不同
                    if (this.userinfo.new_password !== this.userinfo.confirm_password) {
                        this.$Message.error("The password is not consistent!");
                        return;
                    }
                    this.$refs['editPassword'].cb();
                    VueUtil(this).select("Users").action('update_password',{
                        ...this.userinfo,
                        accountKey:1,
                        id:this.$route.params.id,
                        newPassword:this.userinfo.new_password
                    })
                    return;
                case "color":
                    this.$refs['editColor'].cb();
                    break;
            }
            VueUtil(this).select("Users").update(this.userinfo);
        }
    }
}
</script>