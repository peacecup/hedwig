<template>
        <div class="arrow_box" v-bind:class="{addclick:(status=='add')}" >
            <template v-if="status == 'begin'">
                <p style="margin:7px;">Immediately after an incident is triggered  </p>
            </template>
            <template v-else-if="status == 'rule'">
                    <div class="notify">
                        <template v-if="!edit">
                            <section style="margin: 6px;">
                                <Icon type="android-notifications"></Icon>&nbsp;
                                Notify:
                            </section>
                            <div style="padding: 10px;">
                                <template v-for="target in rule.targets">
                                    <div class="target">
                                        <template v-if="target.type == 'user_reference'">
                                            <router-link :to='"/users/"+target.id'><Icon type="person"></Icon>{{target.summary}}</router-link>
                                        </template>
                                        <template v-else>
                                            <permission-router-link :target="target" type="schedule"><Icon type="calendar"></Icon>{{scheduleMap.get(target.id)}}</permission-router-link>
                                        </template>

                                    </div>
                                </template>
                            </div>
                            <div class="rule_footer"><Icon type="arrow-down-c"></Icon>&nbsp;escalates after <strong>{{rule.escalation_delay_in_minutes}} minutes</strong></div>
                        </template>
                        <template v-else>
                            <section style="margin: 6px;">
                                <Icon type="android-notifications"></Icon>&nbsp;
                                Notify the following users or schedules (max. 10)
                                <div class="actions">
                                    <div class="action"  v-if="order" @click="doRuleUp">
                                        <Icon type="arrow-up-c" size="15" ></Icon></Icon>
                                    </div>
                                    <div class="action" v-if="showDown" @click="doRuleDown">
                                        <Icon type="arrow-down-c" size="15" ></Icon></Icon>
                                    </div>
                                    <div class="action" v-if="order" @click="cancelAddRule2">
                                        <Icon type="close" size="15" color="red"></Icon></Icon>
                                    </div>
                                </div>                                
                            </section>
                            <Form ref="ruleForm" :model="rule" :rules="ruleValidate" >
                                <FormItem prop="targets">
                                    <Select v-model="rule.targets"  multiple  style="width:400px;margin: 10px;" ref="escalationTargets">
                                        <OptionGroup label="Schedules">
                                            <Option v-for="schedule in schedules" :label="schedule.name" :value="'schedule_'+schedule.id" :key="'schedule_'+schedule.id" >
                                                <Icon type="calendar"></Icon> {{ schedule.name }}
                                            </Option>
                                        </OptionGroup>
                                        <OptionGroup label="Users">
                                            <Option v-for="user in users" :label="user.name" :value="'user_'+user.id" :key="'user_'+user.id" >
                                                <Icon type="person"></Icon> {{ user.name }}
                                            </Option>
                                        </OptionGroup>
                                    </Select>
                                </FormItem>
                                <FormItem prop="escalation_delay_in_minutes">
                                    <div class="rule_footer">
                                        <Icon type="arrow-down-c" size="20"></Icon>&nbsp;escalates aftero
                                        <InputNumber  :min="1" size="small" v-model="rule.escalation_delay_in_minutes"></InputNumber>minutes.
                                        <span :style="{color:delayMinValid?'':'red'}">(must be at least {{delay_min}} minutes for multiple targets.)</span>
                                    </div>
                                </FormItem>
                            </Form>
                        </template>
                    </div>
            </template>
            <template v-else-if="status == 'add'">
                <h3 style="margin: 6px;" @click="addRule">Add a new Escalation Rule</h3>
            </template>
            <template v-else-if="status == 'end'">
                <div v-if="!edit">
                    <template v-if="old_repeat_enabled">
                        <p style="margin:7px;">Repeats {{old_num_loops}} time if no one acknowledges incidents</p>
                    </template>
                    <template v-else>
                        <p style="margin:7px;">Does not repeat</p>
                    </template>
                </div>
                <div v-else  :style="{color:repeatFontColor}">
                    <Checkbox v-model="repeat_enabled" @on-change="repeatChange">
                        If no one acknowledges, repeat this policy
                        <InputNumber @on-change="repeatChange" :min="1" :max="9" size="small" v-model="num_loops" :disabled="!repeat_enabled" ></InputNumber>
                        times
                    </Checkbox>
                </div>
            </template>
        </div>
</template>

<script scoped>

    import {VueUtil} from '@util';
    import _ from "lodash";
    export default {
        name:'policyStep',
        data(){
            const validateTargets = (rule, value, callback) => {
                if(this.rule.targets.length == 0){
                    callback(new Error(this.$t('valid.targetRequired')));
                }else if(this.rule.targets.length > 10){
                    callback(new Error(this.$t('valid.targetsMax')));
                }else{
                    callback();
                }
            };
            const validateDelayMin = (rule, value, callback) => {
                if(this.rule.targets.length>1 && this.rule.escalation_delay_in_minutes<5){
                    this.delayMinValid = false;
                    callback('');
                }else{
                    this.delayMinValid = true;
                    callback();
                }
            };
            return{
                repeat_enabled:false,
                num_loops:1,
                ruleValidate:{
                    targets:[{ validator: validateTargets, trigger: 'change' }],
                    escalation_delay_in_minutes:[{ validator: validateDelayMin, trigger: 'change' }]
                },
                delayMinValid:true,
            };
        },
        props:{
            status:{
                type:String,required:true,
                default:function(){
                    return 0;
                },
                validator:function(value){
                    const arr = ['begin','rule','end','add'];
                    return arr.includes(value);
                }
            },
            order:{type:Number},
            rule:{ type:Object },
            edit:{
                type:Boolean,
                default:function(){
                    return false;
                }
            },
            cancelAddRule:{ type:Function },
            addRule:{ type:Function},
            repeatChange:{type:Function},
            old_repeat_enabled:{},
            old_num_loops:{},
            ruleUp:{type:Function},
            ruleDown:{type:Function},
            showDown:{},
            users:{},
            schedules:{}
        },
        computed:{
            repeatFontColor(){
                return this.repeat_enabled?'black':'#b3b3b3';
            },
            scheduleMap(){
                let scheduleArray =  _.map( this.schedules,function(value){
                    return [value.id,value.name];
                });
                return new Map(scheduleArray);
            },
            delay_min(){
                return this.rule.targets.length>1?5:1;

            }
        },
        components:{
        },
        methods:{
            cancelAddRule2(){
                this.cancelAddRule(this.order);
            },
            doRuleUp(){
                this.ruleUp(this.order);
            },
            doRuleDown(){
                this.ruleDown(this.order);
            },
            validate(cb){
                this.$refs.ruleForm.validate( valid => {
                    if (valid && this.delayMinValid) {
                        !!cb.ok && cb.ok.call(this);
                    } else {
                        !!cb.err && cb.err.call();
                    }
                });
            },
        },
        watch:{
            old_repeat_enabled(value){
                this.repeat_enabled = _.cloneDeep(value);
            },
            old_num_loops(value){
                this.num_loops = _.cloneDeep(value);
            }
        },
        mounted(){
        }
    };
</script>