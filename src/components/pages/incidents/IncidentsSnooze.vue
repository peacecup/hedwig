<template>
    <Modal width="600px" v-model="value" :title="`Snooze Incident #${incident_number}`"
           :loading="loading" :mask-closable="false"
           @on-ok="submit"
    >
        <DynamicForm :button="{enabled:false}" ref="snoozeForm"
                     :editFields="editFields"
                     :submit="submit"
                     :formValidate="formValidate">
            <template  slot="type">
                <Form-item  prop="type">
                    <Radio-group @on-change="changeType" v-model="formValidate['type']">
                        <div>
                            <Radio label="1">Snooze for </Radio><InputNumber :min="0" @on-change="minitesChange" v-model="minites"></InputNumber>
                        </div>
                        <div style="display: flex;margin-top: 20px;">
                            <Radio label="2" >Snooze until </Radio> <Select style="width: 100px;" @on-change="hoursChange" v-model="hours"><SelectHours></SelectHours></Select> <span style="margin-left:20px;">tomorrow</span>
                        </div>
                    </Radio-group>
                </Form-item>
            </template>
        </DynamicForm>
        <div slot="footer">
            <Button size="large" @click="$emit('input',false)">{{ $t('button.cancel')}}</Button>
            <Button type="primary" size="large" :loading="Incidents.manage.loading" @click="submit" :disabled="duration === 0">{{text}}</Button>
        </div>
    </Modal>

</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'IncidentsSnooze',
        components: {},
        computed: {
            ...VueUtil(this).select(['Incidents']).state(),
        },
        props: {
            value:{
                type: Boolean,
                default: false,
            },
            incidents: {
                type: Array,
            }
        },

        data(){

            let fields = [
                {
                    id: 'type',
                    type: 'slot',
                },
            ]

            let formUtil = FormUtil(this).initFields(fields);

            return {
                formValidate: formUtil.forms(),
                editFields: formUtil.editFields(),
                incident_number: null,
                minites: 0,
                hours: 0,
                duration: 0,
                text: 'Snooze Incident',
                loading:false,
            }
        },
        mounted(){

        },
        watch: {
            value(val){
                this.$emit("input",val);
                if(!val) {
                    this.$refs['snoozeForm'].resetForm();
                    this.minites = 0;
                    this.hours = 0;
                }
            },
            incidents(val){
                if(val && val.length > 0)
                    this.incident_number = val[0].incident_number;
            }
        },
        methods: {
            ...VueUtil(this).select(['Incidents']).actions(),
            changeType(val){
                if (val === '1'){
                    this.minitesChange(this.minites);
                } else if(val === '2'){
                    this.hoursChange(this.hours);
                }
            },
            hoursChange(val){
                this.formValidate.type = "2";
                let tomorrow = moment().add(1,'d').hours(0).minutes(0).seconds(0);
                let offset = Math.floor((tomorrow.unix() - moment().unix() + val) / 60);
                this.duration = offset * 60,
                this.text = `Snooze Incident #${this.incident_number} for ${Math.floor(offset / 60)} hours ${Math.floor(offset % 60)} minites`;

            },
            minitesChange(val){
                this.formValidate.type = "1";
                this.duration = val,
                this.text = `Snooze Incident #${this.incident_number} for ${Math.floor(val / 60)} hours ${Math.floor(val % 60)} minites`;
            },
            snooze(duration){
                const data  = _.map(this.incidents, row =>{
                    return {
                        id: row.id,
                        duration: duration,
                    }
                })
                VueUtil(this).select('Incidents').action('manage', data);
            },
            submit(){
                if(this.duration > 0){
                    this.snooze(this.duration);
                }
            }
        }
    }
</script>