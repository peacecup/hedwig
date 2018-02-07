<template>
    <div class="the_policy" v-pageKey="`escalationPolicy.new`">
        <Row>
            <Col span="20">
                <Form :model="escalationPolicy" label-position="left" :rules="policyVadilate" ref="addEscalationPolicy">
                    <Row >
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
                                    <Input v-model="escalationPolicy.description" type="textarea"
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
                    <Row style="padding:20px;">
                        <Timeline>
                            <TimelineItem color="green">
                                <div class="step_icon" slot="dot"><Icon type="alert" slot="dot"></Icon></div>
                                <policy-step status="begin" ></policy-step>
                            </TimelineItem >
                            <TimelineItem  v-for="(rule,index) in escalationPolicy.escalation_rules" :key="index">
                                <div class="step_icon" slot="dot" ><h3>{{index+1}}</h3></div>
                                <policy-step status="rule" :rule="rule" :edit="true" :order="index" :cancelAddRule="cancelAddRule" ref="targets"
                                   :ruleUp="ruleUp"  :ruleDown="ruleDown" :showDown="index+1 != escalationPolicy.escalation_rules.length"
                                :users="Users.all.data.list" :schedules="Schedules.all.data.list"></policy-step>
                            </TimelineItem>
                            <TimelineItem>
                                <div class="step_icon" slot="dot"><Icon type="plus-round" slot="dot"></Icon></div>
                                <div class="add">
                                    <policy-step status="add" :addRule="addRule"></policy-step>
                                </div>
                            </TimelineItem>
                            <TimelineItem>
                                <div class="step_icon" slot="dot"><Icon type="arrow-swap" slot="dot" :color="repeatColor"></Icon></div>
                                <policy-step status="end"  :edit="true" :repeatChange="onRepeatChange"></policy-step>
                            </TimelineItem>
                        </Timeline>
                    </Row>
                    <Row >
                        <div style="float: left;">
                            <Button type="success" @click="submitAdd">{{ $t('button.submit')}}</Button>
                            <Button @click="back">{{ $t('button.cancel')}}</Button>
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
    import {VueUtil,FormUtil} from '@util';
    import _ from 'lodash';
    let temp = {
        escalation_delay_in_minutes:30,
        targets:[
        ]
    };
    export default {
        data(){

            return{
                escalationPolicy:{
                    type:'escalation_policy',
                    name:"",
                    description:"",
                    teams:"",
                    escalation_rules:[
                        {
                            escalation_delay_in_minutes:30,
                            targets:[
                            ]
                        }
                    ],
                    repeat_enabled:false,
                    num_loops:1,
                },
                showDescription:false,
                policyVadilate:{
                    name:[{required: true, message: this.$t('valid.required')},
                          {validator: FormUtil(this).validator.noSpecialWord, trigger: 'blur'}],
                }
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
            }
        },
        components:{
            policyStep
        },
        methods:{
            ...VueUtil(this).select(['EscalationPolicies','Users','Teams','Schedules']).actions(),
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
                })
                saveData.teams = saveData.teams?[{id:saveData.teams,type:"team_reference"}]:[];
                return saveData;
            },
            back(){
                this.$router.back();
            },
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
                this.$refs['addEscalationPolicy'].validate( valid => {
                    if(valid){
                        let self = this;
                        this.validateTargets({
                            ok: () => {
                                let saveData = this.backFormatTargets(_.cloneDeep(this.escalationPolicy));
                                VueUtil(this).select('EscalationPolicies').save(saveData);
                            },
                            err: () => {

                            }
                        })
                    }
                })
            },
            makesureSave(data){
                VueUtil(this).cb(data).success(() => {
                    this.$Message.success("save EscalationPolicy  successfully.");
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
            },
        },
        watch:{
            'EscalationPolicies.save':'makesureSave'
        },
        mounted(){
            VueUtil(this).select('Teams').list();
            VueUtil(this).select('Users').all();
            VueUtil(this).select('Schedules').all();

        }
    };
</script>
