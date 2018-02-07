<template>
    <div class="maintenance">
        <Row v-show="!loading">
            <Col span="24">
            <h1>{{ type === 'Create' ? 'Create New' :'Update '}} Maintenance Window</h1>
            </Col>
            <Col span="24">
            <div class="divider"></div>
            </Col>
            <Col span="24">
            <Row type="flex">
                <Col span="4">
                <Row>
                    <Col  v-key="[`service.new_maintenance`,'service.edit_maintenance']" span="24" v-if="maintenance.status !== 'Past'">
                    <Button style="width: 100%" icon="checkmark-round" type="success" @click="saveMaintenance">
                        {{type}} maintenance
                    </Button>
                    </Col>
                    <Col v-key="`service.end_maintenance`" span="24" v-if="maintenance.status === 'OnGoing'">
                    <Button style="width: 100%" icon="close" type="warning" @click="endMaintenance">
                        End this maintenance now
                    </Button>
                    </Col>

                    <Col v-key="`service.delete_maintenance`" span="24" v-if="maintenance.status === 'Future'" >
                    <Button style="width: 100%" icon="close" type="error" @click="deleteMaintenance">
                        Delete maintenance
                    </Button>
                    </Col>
                    <Col span="24" v-if="id === null">
                    <Button style="width: 100%" icon="trash-a" @click="discard">Discard all Changes</Button>
                    </Col>
                </Row>
                </Col>
                <Col span="12">
                    <MaintenanceEditForm :form="maintenance" :id="id" :success_cb="success" ref="maintenanceEditForm"></MaintenanceEditForm>
                 </Col>
            </Row>
            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import Vue from 'vue';
    import {VueUtil, FormUtil, ScheduleUtil, PermissionUtil} from '@util';
    import MaintenanceEditForm from './MaintenanceEditForm.vue';

    export default{
        name: 'MaintenanceEdit',
        components: {MaintenanceEditForm},
        computed: {
            ...VueUtil(this).select(['Maintenance', 'Services']).state(),
            allowEdit(){
                let id = _.get(this.maintenance,'services[0]',null)
                if(id){
                    return PermissionUtil.service.allowEdit({id: id})
                }else
                    return false;
            }
        },
        props: {},

        data(){
            return {
                id: null,
                loading: true,
                type: 'Create',
                maintenance : {
                    services:[],
                    status : null,
                }
            }
        },
        mounted(){
            if(this.$route.name === 'Edit Maintenance'){
                this.type = 'Update';
            }

            if(this.$route.params.id){
                VueUtil(this).select('Maintenance').get({
                    id: this.$route.params.id,
                    include:['services'],
                });
            }else{
                this.loading = false;
            }

        },
        watch: {
            'Maintenance.get':'listenMaintenance',
            'Maintenance.delete':'listenMaintenance',
        },
        methods: {
            ...VueUtil(this).select(['Maintenance', 'Services']).actions(),
            listenMaintenance(data){
                VueUtil(this).cb(data).success(() =>{
                    if(data.type === 'get'){
                        let maintenance = {
                            ...data.data,
                        };
                        if(!maintenance.timeZone) {
                            maintenance.timeZone = Vue.config.timezone;
                        }
                        maintenance.services = _.map(maintenance.services , service=> service.id);
                        this.maintenance = maintenance;
                        this.loading = false;
                    }else if(data.type === 'delete') {
                        this.$Message.success('delete maintenace success!');
                        setTimeout(()=> {
                            this.$router.go(-1);
                        }, 600);
                    }
                }).error();
            },
            success(){
              setTimeout(this.discard, 600);
            },
            saveMaintenance(){
               this.$refs['maintenanceEditForm'].saveMaintenance();
            },
            deleteMaintenance(){
               VueUtil(this).select('Maintenance').delete(this.maintenance.id);
            },
            endMaintenance(){
                this.maintenance.end_time = ScheduleUtil.momentToString(moment());
                VueUtil(this).select('Maintenance').update(this.maintenance);
            },
            discard(){
                this.$router.go(-1);
            },
        }
    }
</script>