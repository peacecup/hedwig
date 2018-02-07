<template>
    <div>
        <Modal width="400px" v-model="value" :mask-closable="false" title="Schedule an Override">
            <div>
                Overrides can be used to substitute a particular user at a particular time. The most recently created override will be used in case of overlaps.


            </div>
            <div class="divider"></div>
            <div style="margin: 10px 0px;">
                <DynamicForm :button="{enable:false}" :dicts="dicts" :submit="saveOverride" ref="form"
                             :editFields="editFields" :ruleValidate="ruleValidate"
                             :formValidate="formValidate">
                </DynamicForm>
            </div>
            <div slot="footer">
                <Button size="large" @click="$emit('input',false)">{{ $t('button.cancel')}}</Button>
                <Button type="primary" size="large" :loading="loading" @click="saveOverride">{{ $t('button.submit')}}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil, ScheduleUtil} from '@util';
    import moment from 'moment';
    import Vue from 'vue';

    export default{
        name: 'SchedulesOverride',
        components: {},
        computed: {
            ...VueUtil(this).select(['Users', 'Schedules']).state(),
            ...VueUtil(this).select(['Users']).getters(),
        },
        props: {
            schedule: {
                type: Object,
            },
            override: {
                type: Object,
                default: {}
            },
            value: {
                default: false,
            }
        },

        data(){
            let dateFormat = 'yyyy-MM-dd HH:mm';
            let fields = [
                {
                    id: 'scheduleId',
                    type: 'hidden',
                },
                {
                    id: 'id',
                    type: 'hidden',
                },
                {
                    id: 'user',
                    label: 'User',
                    type: 'select',
                    filterable:true,
                    options: 'users',
                    span: 24,
                    rules: [
                        {required: true, trigger: 'blur'}
                    ]
                },
                {
                    id: 'time_zone',
                    label:'Timezone',
                    type: 'timezone',
                    span: 24,
                    filterable:true,
                    defaultValue: Vue.config.timezone,
                }, {
                    id: "start",
                    label: "Start Time",
                    type: "datetime",
                    format: dateFormat,
                    defaultValue: moment().add(1,'d'),
                    span: 24,
                    rules: [
                        {
                            required: true, message: this.$t('valid.required')
                        }
                    ]
                }, {
                    id: "end",
                    label: "End Time",
                    type: "datetime",
                    format: dateFormat,
                    defaultValue: moment().add(2,'d'),
                    span: 24,
                    rules: [
                        {
                            required: true, message: this.$t('valid.required')
                        }
                    ]
                },
            ];
            let dicts = {
                users: [],
            }
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            return {
                loading: false,
                dicts,
                editFields: formUtil.editFields(),
                formValidate: formUtil.forms(),
                ruleValidate: formUtil.rules(),
            }
        },
        mounted(){
            VueUtil(this).select("Users").all();
        },
        watch: {
            "Schedules.override_save": "listenSchedulesOverride",
            "override": "initEntity",
            "Users.all": "listenUsers",
            value(val){
                if (!val) {
                    this.$emit('input', val);
                    this.$refs['form'].resetForm();
                    this.formValidate.user = '';
                }
            }
        },
        methods: {
            ...VueUtil(this).select(['Users', 'Schedules']).actions(),
            listenUsers(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'all') {
                        this.dicts.users = this.allUserOptions;
                    }
                }).error();
            },
            listenSchedulesOverride(data){
                VueUtil(this).cb(data).success(() => {
                    this.loading = false;
                    this.$emit('input',false);
                }).error();
            },
            saveOverride(){
                this.$refs['form'].validate({
                    ok: (data) => {
                        this.loading = true;
                        VueUtil(this).select("Schedules").action('override_save', {
                            scheduleId: this.schedule.id,
                            ...data,
                            start: ScheduleUtil.momentToString(moment(data.start)),
                            end: ScheduleUtil.momentToString(moment(data.end)),
                        },(proxy) => {
                            proxy.user = {
                                id: proxy.user
                            }
                            proxy.scheduleId = this.schedule.id;
                            return proxy;
                        });
                    },
                    err: () => {
                        this.loading = false;
                    }
                });
            },
            validate(cb){
                this.entity.end = moment(this.entity.end).format('YYYY-MM-DD HH:mm')
                this.entity.start = moment(this.entity.start).format('YYYY-MM-DD HH:mm')
                !!cb.ok && cb.ok.call(this, this.entity);
            },
            initEntity(){
                this.formValidate = {
                    start:  this.override.start,
                    end:  this.override.end,
                    time_zone:  this.override.time_zone,
                    user:  _.get(this.override,'user.id',''),
                };
            },
            reset(){
                this.$refs['overrideForm'].resetFields();
            },
        }
    }
</script>