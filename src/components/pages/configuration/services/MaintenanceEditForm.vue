<template>
    <div>
        <DynamicForm :dicts="dicts" :editFields="editFields" :button="button" ref="form" :submit="saveMaintenance"
                     :formValidate="formValidate" :ruleValidate="ruleValidate"
        ></DynamicForm>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import Vue from 'vue';
    import {VueUtil, FormUtil, ScheduleUtil} from '@util';

    export default{
        name: 'MaintenanceEditForm',
        components: {},
        computed: {
            ...VueUtil(this).select(['Maintenance', 'Services']).state(),
        },
        props: {
            success_cb: {
                type: Function,
            },
            service_id: {
                type: String,
            },
            value: {
                type: Object,
            },
            form: {
                type: Object,
            }
        },

        data(){
            const dicts = {
                services: []
            }
            const fields = [
                {
                    id: "id",
                    label: "id",
                    type: "hidden",
                }, {
                    id: "services",
                    label: "Services",
                    type: "select",
                    options: "services",
                    disabled: false,
                    span: 24,
                    style: {width: '350px'},
                    multiple: true,
                    rules: [
                        {
                            required: true, message: this.$t('valid.required')
                        }
                    ]
                }, {
                    id: "timeZone",
                    label: "timezone",
                    type: "timezone",
                    filterable: true,
                    style:{width:'100%'},
                    defaultValue: Vue.config.timezone,
                    span: 24,
                    style: {width: '350px'},
                    rules: [
                        {
                            required: true, message: this.$t('valid.required')
                        }
                    ]
                }, {
                    id: "start_time",
                    label: "Start Time",
                    type: "datetime",
                    format: "yyyy-MM-dd HH:mm",
                    defaultValue: moment(),
                    span: 24,
                    rules: [
                        {
                            required: true, message: this.$t('valid.required')
                        }
                    ]
                }, {
                    id: "end_time",
                    label: "End Time",
                    type: "datetime",
                    format: "yyyy-MM-dd HH:mm",
                    defaultValue: moment().add(1, 'h'),
                    span: 24,
                    rules: [
                        {
                            required: true, message: this.$t('valid.required')
                        }
                    ]
                }, {
                    id: "createdBy",
                    label: "Created by",
                    type: "hidden",
                    span: 24,
                }, {
                    id: "description",
                    label: "description",
                    type: "textarea",
                    span: 24,
                },];
            var formUtil = FormUtil(this).initFields(fields);
            return {
                dicts,
                editFields: formUtil.editFields(),
                formValidate: formUtil.forms(),
                ruleValidate: formUtil.rules(),
                button: {
                    enabled: false
                }
            }
        },
        mounted(){
            VueUtil(this).select("Services").action('all');
        },
        watch: {
            "Services.all": "listenServices",
            "Maintenance.save": "listenMaintenance",
            "Maintenance.update": "listenMaintenance",
            "service_id": "listenServiceId",
            "form": "listenForm",
            "value": "listenValue",
        },
        methods: {
            ...VueUtil(this).select(['Maintenance', 'Services']).actions(),
            listenValue(value){
                if (value){
                    if(!value.start_time) {
                        this.formValidate.services = value.services;
                    }else{
                        this.formValidate = value;
                    }
                }
            },
            listenForm(form){
                this.formValidate = form;
                if (form.id) {
                    this.editFields[1].disabled = true;
                }
                if(form.status === 'OnGoing'){
                    this.editFields[3].disabled = true;
                }
            },
            listenServiceId(serviceId){
                if (serviceId) {
                    this.formValidate.services = [serviceId];
                    this.editFields[1].disabled = true;
                }
            },
            listenServices(data){
                VueUtil(this).cb(data).success(() => {
                    this.dicts.services = _.map(data.data.list, s => {
                        return {label: s.name, value: s.id};
                    });
                });
            },
            listenMaintenance(data){
                VueUtil(this)
                    .cb(data)
                    .success(() => {
                        this.$Message.success(`${data.type} success!`);
                        if (this.success_cb && _.isFunction(this.success_cb)) {
                            this.success_cb.call();
                        }
                    }).error();
            },
            beforeSave(maintenance){
                maintenance.start_time = ScheduleUtil.momentToString(moment(maintenance.start_time).add(-8,'h'));
                maintenance.end_time = ScheduleUtil.momentToString(moment(maintenance.end_time).add(-8,'h'));
                return maintenance;
            },
            resetForm(){
                this.$refs['form'].handleReset('formValidate');
            },
            saveMaintenance(){
                this.loading = true;
                this.$refs['form'].validate({
                    ok: (data) => {
                        if (data.start_time >= data.end_time) {
                            this.$Message.error("End Time cant't before Start Time")
                            return;
                        }
                        if (!!data.id)
                            VueUtil(this).select('Maintenance').update(data, this.beforeSave);
                        else
                            VueUtil(this).select('Maintenance').save(data, this.beforeSave);
                    }, err: () => {
                        this.loading = false;
                    }
                });
            },
            discard(){
                this.$router.push('/services/maintenance')
            },


        }
    }
</script>