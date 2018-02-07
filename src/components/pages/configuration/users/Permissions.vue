<template>
    <div class="permissions" style="position: relative;" >
        <h2 style="margin: 10px 0;">Role</h2>
        <template v-if="!isEdit">
            <Row>
                <Col span="12">
                <Alert>
                    <strong>{{selectedRole.label}}</strong>
                    <p v-html ="selectedRole.discription"></p>
                </Alert>
                </Col>
                <Col span="12">
                <!--  <Key id="user_permission" >-->
                <a href="javascript:void(0)" @click="edit" v-if="showEdit">
                    <Icon type="edit"></Icon>
                    Edit</a>
                <!-- </Key>-->
                </Col>
            </Row>
        </template>
        <template v-else>
            <Row :style="{border:selectedBorder.fixed}" style="padding:10px;border-radius:5px;">
                <Row>
                    <p>Fixed</p>
                </Row>
                <Row>
                    <Col span="7">
                    <Alert>
                        A fixed role determines a user’s access to all objects in the account. This cannot be overridden.
                    </Alert>
                    </Col>
                    <Col span="13">
                    <Dropdown trigger="click" @on-click="changeFixedRole">
                        <Button long size="large" >
                            <div class="role_visible" style="width: 535px;height: 55px;">
                                <section style="text-align: left;" >
                                    <strong>{{selectedFR.label}}</strong>
                                    <p v-html ="selectedFR.discription"></p>
                                </section>
                                <Icon type="arrow-down-b"></Icon>
                            </div>
                        </Button>
                        <DropdownMenu slot="list">
                            <DropdownItem :name="role.key" :key="role.key" v-for="role in dict.fixedRole" v-if="!role.disabled">
                                <div class="role_visible" style="width: 535px;">
                                    <section style="text-align: left;">
                                        <strong>{{role.label}}</strong>
                                        <p v-html ="role.discription"></p>
                                    </section>
                                </div>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    </Col>
                    <Col span="4">
                    <div v-if="userRole.fixed !== 'fixed'">
                        <Button type="success" @click="save" :disabled="ableToSave">Save</Button>
                        <Button @click="cancel">{{ $t('button.cancel')}}</Button>
                    </div>
                    </Col>
                </Row>
            </Row>
            <Row :style="{border:selectedBorder.flexable}" style="padding:10px;border-radius:5px;">
                <Row>
                    <p>Flexible</p>
                </Row>
                <Row>
                    <Col span="7">
                    <Alert>
                        A flexible role includes a base role, which determines access to all objects in the account. This can be overridden by granting additional permissions to selected objects.
                    </Alert>
                    </Col>
                    <Col span="13">
                    <Dropdown  trigger="click" @on-click="changeFlexableRole">
                        <Button long size="large" >
                            <div class="role_visible" style="width: 535px;height: 55px;">
                                <section style="text-align: left;" >
                                    <strong>{{selectedFAR.label}}</strong>
                                    <p v-html ="selectedFAR.discription"></p>
                                </section>
                                <Icon type="arrow-down-b"></Icon>
                            </div>
                        </Button>
                        <DropdownMenu slot="list">
                            <DropdownItem :name="role.key" :key="role.key" v-for="role in dict.flexableRole" v-if="!role.disabled">
                                <div class="role_visible" style="width: 535px;">
                                    <section style="text-align: left;">
                                        <strong>{{role.label}}</strong>
                                        <p style="width: 90%;text-wrap: normal;" v-html ="role.discription"></p>
                                    </section>
                                </div>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    </Col>
                    <Col span="4">
                    <div v-if="this.userRole.flexable !== 'flexable'">
                        <Button type="success" @click="save" :disabled="ableToSave">Save</Button>
                        <Button @click="cancel">{{ $t('button.cancel')}}</Button>
                    </div>
                    </Col>
                </Row>
                <Row v-if="this.userRole.fixed === 'fixed'">
                    <Row>
                        <Col span="13" offset="7">
                        <h2>Additional Permissions</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="7">
                        <PermissionsCard :selects="selects.manager" :dataMap="dataMap">
                            <div slot="title">
                                <Icon type="settings"></Icon>
                                <strong>Manager</strong> access to:
                            </div>
                        </PermissionsCard>
                        </Col>
                        <Col span="13" style="z-index:5;">
                        <div style="margin-bottom: 10px;">
                            <p>Manager Access to</p>
                            <div>
                                <Input icon="search" placeholder="Search for objects" @on-focus="selectorFocus('manager')"/>
                                <div v-if="selector.manager" style="border: 1px solid #e9eaec;">
                                    <SelectObjects :selectChange="selectChange" :selects="selects.manager"
                                                   :dataMap="dataMap"
                                                   :Services="ServicesSelector"
                                                   :EscalationPolicies="EscalationPoliciesSelector"
                                                   :Schedules="SchedulesSelector"></SelectObjects>
                                </div>
                            </div>
                        </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="7">
                        <PermissionsCard :selects="selects.responder" :dataMap="dataMap">
                            <div slot="title">
                                <Icon type="person"></Icon>
                                <strong>Responder</strong> access to:
                            </div>
                        </PermissionsCard>
                        </Col>
                        <Col span="13" style="z-index:5;">
                        <div style="margin-bottom: 10px;">
                            <p>Responder Access to</p>
                            <Input icon="search" placeholder="Search for objects" @on-focus="selectorFocus('responder')"/>
                            <div v-if="selector.responder" style="border: 1px solid #e9eaec;">
                                <SelectObjects :selectChange="selectChange" :selects="selects.responder"
                                               :dataMap="dataMap"
                                               :Services="ServicesSelector"
                                               :EscalationPolicies="EscalationPoliciesSelector"
                                               :Schedules="SchedulesSelector"></SelectObjects>
                            </div>
                        </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="7">
                        <PermissionsCard :selects="selects.observer" :dataMap="dataMap">
                            <div slot="title">
                                <Icon type="ios-glasses"></Icon>
                                <strong>Observer</strong> access to:
                            </div>
                        </PermissionsCard>
                        </Col>
                        <Col span="13" style="z-index:5;">
                        <div style="margin-bottom: 10px;">
                            <p >Observer Access to</p>
                            <Input icon="search" placeholder="Search for objects" @on-focus="selectorFocus('observer')"/>
                            <div v-if="selector.observer" style="border: 1px solid #e9eaec">
                                <SelectObjects :selectChange="selectChange" :selects="selects.observer"
                                               :dataMap="dataMap"
                                               :Services="ServicesSelector"
                                               :EscalationPolicies="EscalationPoliciesSelector"
                                               :Schedules="SchedulesSelector"></SelectObjects>
                            </div>

                        </div>
                        </Col>
                    </Row>
                </Row>

            </Row>

            </Col>
        </template>
        <div class="mask-layer" v-if="selector.observer || selector.responder || selector.manager"
             @click="closeMasklayer"></div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';
    import SelectObjects from './SelectObjects';
    import PermissionsCard from './PermissionsCard.vue';

    export default{
        components: {SelectObjects,PermissionsCard},
        computed: {
            ...VueUtil(this).select(['Users','Services', 'Schedules', 'EscalationPolicies']).state(),
            selectedFR(){
                return _.get(this.roleMap,this.userRole.fixed);
            },
            selectedFAR(){
                return _.get(this.roleMap,this.userRole.flexable);
            },
            selectedBorder(){
                let fixedBorder = this.userRole.fixed === 'fixed'?'none':'1px solid #DBDCDE';
                let flexableBorder = this.userRole.flexable === 'flexable'?'none':'1px solid #DBDCDE';
                return {
                    fixed:fixedBorder,
                    flexable:flexableBorder
                }
            },
            showEdit(){
                if(this.Users.me.data.role === 'owner'||this.Users.me.data.role === 'admin'){
                    return true;
                }else{
                    return false;
                }
            },
            ableToSave(){
                let roleChange = this.userRole.role !== this.role;
                let addlitionalChange = false;
                _.forEach(this.selects,(addlitionals) => {
                    _.forEach(addlitionals,(ids) => {
                        if(ids.length>0){
                            addlitionalChange = true;
                        }
                    })
                })
                return !(roleChange||addlitionalChange);

            }
        },
        props: {
            role:{}
        },
        data(){
            const dict = {
                fixedRole:[
                    {
                        type:'fixed',
                        disabled:true,
                        label:"Select A Fixed Role",
                        value:"1",
                        key:"fixed",
                        discription:""
                    },
                    {
                        type:'fixed',
                        disabled:true,
                        label:"Account Owner",
                        value:"1",
                        key:"owner",
                        discription:"Can modify all objects, user permissions,and account settings (including billing). "
                    },
                    {
                        type:'fixed',
                        label:"Gloable Admin",
                        value:"2",
                        key:"admin",
                        discription:"Can modify all objects and user permissions!"
                    },
                    {
                        type:'fixed',
                        label:"Stakeholder",
                        value:"7",
                        key:"read_only_user",
                        discription:"Can view all objects,but cannot make any modifications.<br>Cannot be given Additional Permissions."
                    }
                ],
                flexableRole:[
                    {
                        type:'flexable',
                        disabled:true,
                        label:"Select A Base Role",
                        value:"1",
                        key:"flexable",
                        discription:""
                    },
                    {
                        type:'flexable',
                        label:"Manager",
                        value:"3",
                        key:"user",
                        discription:"Can modify all objects,but may be given lower access levels for specific objects."
                    },
                    {
                        type:'flexable',
                        label:"Responder",
                        value:"4",
                        key:"limited_user",
                        discription:"Can perform actions on incidents and create overrides."
                    },
                    {
                        type:'flexable',
                        label:"Team Responder",
                        value:"5",
                        key:"team_responder",
                        discription:"Can perform actions on incidents.<br>and create overrides for objects belonging to their teams."
                    },
                    {
                        type:'flexable',
                        label:"Observer",
                        value:"6",
                        key:"observer",
                        discription:"Can view objects,but cannot make any modifications."
                    },
                    {
                        type:'flexable',
                        label:"Restricted Access",
                        value:"8",
                        key:"restricted_access",
                        discription:"You must assign this user to a Team for access to incidents and objects."
                    }
                ]
            };
            const roleMap = {};
            _.forEach(dict.fixedRole,(value) => {
                roleMap[value.key]  = value;
            });
            _.forEach(dict.flexableRole,value => {
                roleMap[value.key]  = value;
            });
            const dataMap = {
                service:new Map(),
                schedule:new Map(),
                escalationPolicy: new Map()
            };
            return {
                dict,
                userRole:{
                    role:"none",
                    fixed:"fixed",
                    flexable:"flexable"
                },
                dataMap,
                roleMap,
                selectedLoaded:false,
                selectedRole:{
                    label:"",
                    discription:""
                },
                isEdit: false,
                selector: {
                    manager: false,
                    responder: false,
                    observer: false
                },
                selects: {
                    manager: {
                        service: [],
                        escalationPolicy: [],
                        schedule: []
                    },
                    responder: {
                        service: [],
                        escalationPolicy: [],
                        schedule: []
                    },
                    observer: {
                        service: [],
                        escalationPolicy: [],
                        schedule: []
                    },
                },
            }
        },
        mounted(){
            this.loadData();
        },
        watch: {
            "Services.all": "listenServices",
            "Schedules.all": "listenSchedules",
            "EscalationPolicies.all": "listenEscalationPolicies",
            "Users.update":"listenAdditionalPermission",
            "Users.additional_permission_save":"listenAdditionalPermission",
            "Users.additional_permission_get":"listenAdditionalPermission",
            "Users.additional_permission_update":"listenAdditionalPermission",
            role(value){
                this.userRole.role = value;
                if(this.roleMap[value].type === 'fixed'){
                    this.userRole.fixed = value;
                }else{
                    this.userRole.flexable = value;
                }
                this.selectedRole = this.roleMap[value];
            }
        },
        methods: {
            ...VueUtil(this).select(['Users','Services', 'Schedules', 'EscalationPolicies']).actions(),
            changeFixedRole(role){
                this.userRole.fixed = role;
                this.userRole.flexable = 'flexable';
                this.userRole.role = role;
            },
            changeFlexableRole(role){
                this.userRole.flexable = role;
                this.userRole.fixed = 'fixed';
                this.userRole.role = role;
            },
            listenServices(data){
                VueUtil(this).cb(data).success(() => {
                    this.ServicesSelector = _.map(data.data.list, service => {
                        this.dataMap.service.set(service.id,service);
                        return {id:service.id,name:service.name, checked: false}
                    });

                })
            },
            listenSchedules(data){
                VueUtil(this).cb(data).success(() => {
                    this.SchedulesSelector = _.map(data.data.list, schedule => {
                        this.dataMap.schedule.set(schedule.id,schedule);
                        return {id:schedule.id, name:schedule.name,checked: false}
                    })
                })
            },
            listenEscalationPolicies(data){
                VueUtil(this).cb(data).success(() => {
                    this.EscalationPoliciesSelector = _.map(data.data.list, escalationPolicies => {
                        this.dataMap.escalationPolicy.set(escalationPolicies.id,escalationPolicies);
                        return {id:escalationPolicies.id, name:escalationPolicies.name,checked: false}
                    })
                })
            },
            selectChange(value){
            },
            listenAdditionalPermission(data){
                VueUtil(this).cb(data).success( () => {
                    if(data.type === 'additional_permission_get'){
                        _.forEach(this.selects,(additionals,role) => {
                            _.forEach(additionals,(ids,datatype) => {
                                    this.$set(this.selects[role],datatype,[]);
                            })
                        });
                        _.forEach(data.data.list,(additionalPermission) => {
                            _.forEach(additionalPermission.resources,(resource)=> {
                                this.selects[additionalPermission.role][resource.type].push(resource.id);
                            })
                        })
                        this.selectedLoaded = true;
                        this.isEdit = true;
                    }else if(data.type === 'additional_permission_update'){
                        this.isEdit = false;
                        this.selectedLoaded = false;
                        this.$emit("Pchange");
                    }else if(data.type === 'update'){
                        this.$emit("Pchange");
                    }
                }).error()
            },
            edit(){
                if(!this.selectedLoaded){
                    VueUtil(this).select('Users').action('additional_permission_get',
                        {userId:this.$route.params.id})
                }else{
                    this.isEdit = true;
                }
            },
            save(){
                let data = {
                    userId:this.$route.params.id,
                    additionalPermissions:[],
                    role:this.userRole.role
                }
                let tempData = _.cloneDeep(this.selects);
                _.forEach(tempData,(additionals,role) => {
                    if(additionals.service.length !== 0 ||
                        additionals.escalationPolicy.length !== 0 ||
                        additionals.schedule.length !== 0){
                        let addition = data.additionalPermissions.push({
                            role:role,resources:[],userId:this.$route.params.id
                        });
                        _.forEach(additionals,(resources,type) => {
                            if(resources.length > 0) {
                                _.forEach(resources,resource => {
                                    data.additionalPermissions[addition-1].resources.push({
                                        id:resource,
                                        type:type
                                    });
                                })

                            }
                        })
                    }
                })
                if(this.userRole.role !== this.role){
                    if(_.isEmpty(this.Users.get.data)){
                        VueUtil(this).select('Users').get({userId:this.$route.params.id});
                    }
                    setTimeout(() => {
                        let user = _.cloneDeep(this.Users.get.data);
                        user.role = this.userRole.role;
                        VueUtil(this).select('Users').update(user);
                    }, 600);

                }
                //保存固定权限
                if(this.userRole.fixed !== 'fixed'){
                    data.additionalPermissions = [];
                }
                VueUtil(this).select('Users').action('additional_permission_update',data);
            },
            cancel(){
                this.isEdit = false;
                this.userRole.role = this.role;

            },
            loadData(){
                VueUtil(this)
                    .select('Schedules').all()
                    .select('Services').all()
                    .select('EscalationPolicies').all();
            },
            selectorFocus(k){
                _.keys(this.selector).map(key => {
                    if (key === k) {
                        this.selector[key] = true;
                    } else {
                        this.selector[key] = false;
                    }
                })
            },
            closeMasklayer(){
                this.selector.observer = false;
                this.selector.responder = false;
                this.selector.manager = false;
            }
        }
    }
</script>