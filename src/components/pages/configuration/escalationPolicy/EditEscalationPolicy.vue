<template>
    <div class="the_policy" v-pageKey="{key:`escalationPolicy.edit`,ignore:permission}">
        <Row>
            <Col span="20">
                <Form :model="escalationPolicy" label-position="left" :rules="policyVadilate" ref="editEscalationPolicy">
                    <Row>
                        <Col span="12" >
                            <FormItem prop="name">
                                <Input v-model="escalationPolicy.name" :maxlength="100" size="large" placeholder="Escalation policy name"></Input>
                            </FormItem>
                        </Col>
                        <Col span="12" >
                            <div style="float: right;cursor: pointer;">
                                <span @click="showDescription=!showDescription">Description (optional)<Icon :type="arrowWay" ></Icon></span>
                            </div>
                        </Col>
                    </Row>
                    <div class="divider"></div>
                    <Row>
                        <template v-if="showDescription">
                            <Col span="12">
                                <FormItem  label="Description" prop="description">
                                    <Input v-model="escalationPolicy.description"  type="textarea"
                                           placeholder="Add a description for this escalation policy(optional)"></Input>
                                </FormItem>
                            </Col>
                        </template>
                    </Row>
                    <Row>
                        <Col span="24">
                            <FormItem label="team">
                                <Select v-model="escalationPolicy.teams" style="width:260px" clearable>
                                     <Option v-for="item in Teams.list.data.list" :value="item.id" :key="item.id">{{ item.name }}</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row style="padding: 20px;">
                        <Timeline>
                            <TimelineItem color="green">
                                <div class="step_icon" slot="dot"><Icon type="alert" slot="dot"></Icon></div>
                                <policy-step status="begin" ></policy-step>
                            </TimelineItem >
                            <TimelineItem  v-for="(rule,index) in escalationPolicy.escalation_rules" :key="index">
                                    <div class="step_icon" slot="dot" ><h3>{{index+1}}</h3></div>
                                    <policy-step status="rule" :rule="rule" :edit="true" :order="index" :cancelAddRule="cancelAddRule" ref="targets"
                                       :ruleUp="ruleUp"  :ruleDown="ruleDown" :showDown="index+1 != escalationPolicy.escalation_rules.length"
                                                 :users="Users.all.data.list" :schedules="Schedules.all.data.list" ></policy-step>
                            </TimelineItem>
                            <TimelineItem>
                                <div class="step_icon" slot="dot"><Icon type="plus-round" slot="dot"></Icon></div>
                                <div class="add">
                                    <policy-step status="add" :addRule="addRule"></policy-step>
                                </div>
                            </TimelineItem>
                            <TimelineItem>
                                <div class="step_icon" slot="dot"><Icon type="arrow-swap" slot="dot" :color="repeatColor"></Icon></div>
                                <policy-step status="end"  :edit="true" :repeatChange="onRepeatChange"
                                             :old_repeat_enabled="escalationPolicy.repeat_enabled"
                                           :old_num_loops="escalationPolicy.num_loops"></policy-step>
                            </TimelineItem>
                        </Timeline>
                    </Row>
                    <Row >
                        <div style="float: left;">
                            <Button type="success" @click="submitAdd">{{ $t('button.submit')}}</Button>
                            <Button @click="back">{{ $t('button.cancel')}}</Button>
                        </div>
                        <div style="float: right;">
                            <Button @click="delEscalationPolicy" type="error">delete</Button>
                        </div>
                    </Row>
                </Form>
            </Col>
            <Col span="4">
            </Col>

        </Row>
    </div>
</template>

<script scoped>
    import policyStep from './policyStep.vue';
    import {VueUtil,FormUtil,PermissionUtil} from '@util';
    import _ from 'lodash';
    let temp = {
        escalation_delay_in_minutes:30,
        targets:[
        ]
    };
    export default {
        data(){
            return{
                escalationPolicy:{},
                showDescription:false,
                policyVadilate:{
                    //缺少最大100长度的校验
                    name:[ {required: true, message: this.$t('valid.required')},
                        {validator: FormUtil(this).validator.noSpecialWord, trigger: 'blur'}]
                },
            };
        },
        props:{
        },
        computed:{
            ...VueUtil(this).select(['EscalationPolicies','Users','Teams','Schedules']).state(),
            arrowWay(){
                return this.showDescription?"arrow-down-b":"arrow-up-b";
            },
            repeatColor(){
                return this.escalationPolicy.repeat_enabled?"":"#d6d6d6";
            },
            permission(){
                return PermissionUtil.escalationPolicy.allowEdit({id: this.$route.params.id});
            }
        },
        components:{
            policyStep,
        },
        methods:{
            ...VueUtil(this).select(['EscalationPolicies','Users','Teams','Schedules']).actions(),
            initEscalationPolicy(result){
                if(!result.loading){
                    this.escalationPolicy = result.data;
                    this.formatData();
                }
            },
            delEscalationPolicy(){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select('EscalationPolicies').delete(this.escalationPolicy.id);
                    }
                });
            },
            makeSureDelete(data){
                VueUtil(this).cb(data).success(() => {
                    this.$Message.success("delete EscalationPolicy  successfully.");
                    this.$router.push(`/policies`);
                }).error();
            },
            formatData(){
                this.escalationPolicy.escalation_rules.forEach( value =>{
                    let formatTarget = [];
                    value.targets.forEach( (target,index) => {
                        formatTarget[index] = target.type.split("_")[0]+"_"+target.id;
                    })
                    value.targets = formatTarget;
                });
//                console.log(this.escalationPolicy.teams);
                this.escalationPolicy.teams = this.escalationPolicy.teams.length?this.escalationPolicy.teams[0].id:"";
            },
            backFormatTargets(saveData){
                saveData.escalation_rules.forEach( value =>{
                    let new_targets = []
                    value.targets.forEach( (target,index) => {
                        new_targets[index] = {
                            id: target.split("_")[1],
                            type: target.split("_")[0]+"_"+"reference",
                        }
                    })
                    value.targets = new_targets;
                });
                saveData.teams = saveData.teams?[{id:saveData.teams,type:"team_reference"}]:[];
                return saveData;
            },
            back(){
                this.$router.back();
            },
            //所有升级规则是否选择目标的校验，为了获取组件焦点
            validateTargets(cb){
                let allFlag = true;
                this.$refs['targets'].forEach( (value)=> {
                    value.validate({
                        ok: () => {
                        },
                        err: () => {
                            allFlag = false;
                        }
                    })
                })
                if(allFlag){
                    !!cb.ok && cb.ok.call(this);
                }
            },
            submitAdd(){
                this.$refs['editEscalationPolicy'].validate( valid => {
                    if(valid) {
                        this.validateTargets({
                            ok: () => {
                                let saveData = this.backFormatTargets(_.cloneDeep(this.escalationPolicy));
                                VueUtil(this).select('EscalationPolicies').update(saveData);
                            },
                            err: () => {
                            }
                        });
                    }
                })
            },
            makesureUpdate(data){
                VueUtil(this).cb(data).success(() => {
                    this.$Message.success("update EscalationPolicy  successfully.");
                    this.$router.push(`/policies/${data.data.id}/detail`);
                }).error();
            },
            onRepeatChange(value){
                let type = typeof value;
                if(type == "boolean"){
                    this.escalationPolicy.repeat_enabled = value;
                }else{
                    this.escalationPolicy.num_loops = value;
                }
            },
            addRule(){
                let length = this.escalationPolicy.escalation_rules.length;
                if(length >=20) return;
                this.escalationPolicy.escalation_rules.splice(length,0,_.cloneDeep(temp));
            },
            cancelAddRule(order){
                this.escalationPolicy.escalation_rules = _.filter(this.escalationPolicy.escalation_rules, (value,index) =>{
                    return index != order;
                })
            },
            ruleUp(index){
                //交换index和index+1位置的元素
                if(index == 0) return;
                let x = index; let y=x-1;
                let tempArr = _.cloneDeep(this.escalationPolicy.escalation_rules);
                tempArr.splice(x, 1, ...tempArr.splice(y, 1, tempArr[x]))
                this.escalationPolicy.escalation_rules = tempArr;
            },
            ruleDown(index){
                //交换index和index-1位置的元素
                if(index == this.escalationPolicy.escalation_rules.length-1) return;
                let x = index; let y=x+1;
                let tempArr = _.cloneDeep(this.escalationPolicy.escalation_rules);
                tempArr.splice(x, 1, ...tempArr.splice(y, 1, tempArr[x]))
                this.escalationPolicy.escalation_rules = tempArr;
            }
        },
        watch:{
            'EscalationPolicies.get':'initEscalationPolicy',
            'EscalationPolicies.delete':'makeSureDelete',
            'EscalationPolicies.update':'makesureUpdate',
        },
        mounted(){
            VueUtil(this).select('EscalationPolicies').get({ id: this.$route.params.id, include: ["teams","services","targets"]});
            VueUtil(this).select('Teams').list().select('Users').all().select('Schedules').all();


        }
    };
</script>
