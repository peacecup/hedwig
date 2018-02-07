<template>
    <Row>
        <Col span="15" style="padding: 0px;">
            <Button v-key="{key:'incident.acknowledge',type:'disabled'}" icon="alert" :disabled="!permission" @click="updateStatus('acknowledged')">
                    {{I18n('acknowledge')}}
            </Button>
                <Button v-key="{key:'incident.reassign',type:'disabled'}" icon="navigate" :disabled="!permission" @click="openReAssign">
                    {{I18n('reassign')}}
            </Button>
                <Button v-key="{key:'incident.resolve',type:'disabled'}" icon="checkmark" :disabled="!permission" @click="updateStatus('resolved')">
                    {{I18n('resolve')}}
            </Button>
                <Dropdown  placement="bottom-end" @on-click="snooze">
                    <Button v-key="{key:'incident.snooze',type:'disabled'}"  :loading="loading" :disabled="!permission" icon="clock">
                        {{I18n('snooze')}}
                  <Icon type="arrow-down-b"></Icon>
                    </Button>
                    <Dropdown-menu slot="list" v-if="permission">
                        <Dropdown-item :name="3600">1 {{I18n('hours')}}</Dropdown-item>
                        <Dropdown-item :name="3600 * 4">4 {{I18n('hours')}}</Dropdown-item>
                        <Dropdown-item :name="3600 * 8">8 {{I18n('hours')}}</Dropdown-item>
                        <Dropdown-item :name="3600 * 24">24 {{I18n('hours')}}</Dropdown-item>
                        <Dropdown-item name="others">{{I18n('others')}}</Dropdown-item>
                    </Dropdown-menu>
                </Dropdown>
                <Button v-key="{key:'incident.merge',type:'disabled'}" v-if="permission" :disabled="false" icon="cube" @click="showMergeModal">{{I18n('merge incidents')}}</Button>&nbsp;
        </Col>
        <Col span="9" style="text-align: right;padding: 0px;">
            <Page v-if="position === 'bottom'" :total="total" :current="current" size="small" :page-size="pageSize"
                  @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                  show-sizer></Page>
            <div v-if="position === 'top'" style="text-align: right;">
                    Go to incident # <Input style="width:100px;" placeholder="#num" @on-keydown="getIncidentByNumber" v-model="search.incident_number"/>
            </div>
        </Col>
        <IncidentsMerge v-model="modal.merge" :incidents="selectRows"></IncidentsMerge>
        <IncidentsReAssign  v-model="modal.reAssign" :incidents="selectRows"></IncidentsReAssign>
        <IncidentsSnooze  v-model="modal.snooze" :incidents="selectRows"></IncidentsSnooze>
    </Row>
</template>

<script>
    import _ from 'lodash';
    import store from 'store';
    import {VueUtil, FormUtil} from '@util';
    import IncidentsReAssign from './IncidentsReAssign.vue';
    import IncidentsMerge from './IncidentsMerge.vue';
    import IncidentsSnooze from './IncidentsSnooze.vue';

    export default{
        components: {IncidentsReAssign, IncidentsMerge, IncidentsSnooze},
        computed: {
            ...VueUtil(this).select(['Incidents','Users']).state(),
        },
        methods: {
            ...VueUtil(this).select(['Incidents','Users']).actions(),
            showMergeModal(){
                this.modal.merge = true;
            },
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            validNumber(number){
                if(!/^[0-9]*$/.test(number)){
                    this.$Message.warning('please input a number!');
                    return false;
                }else{
                    return true;
                }
            },
            getIncidentByNumber(event){

                if(event.keyCode === 13 && this.validNumber(this.search.incident_number)){
                    VueUtil(this).select('Incidents').action('gotoByIncidentsNumber', {incident_number: this.search.incident_number});
                }

                return false;
            },
            snooze(duration){
                if (_.isNumber(duration)) {
                    const data  = _.map(this.selectRows, row =>{
                        return {
                            id: row.id,
                            duration: duration,
                        }
                    })
                    VueUtil(this).select('Incidents').action('manage', data);
                } else if (duration === 'others') {
                    this.modal.snooze =true;
                }
            },
            updateStatus(status){
                const list = _.map(this.selectRows, row => {
                    return {
                        id: row.id,
                        status: status,
                    }
                })
                VueUtil(this).select('Incidents').action('manage', list);
            },

            listenIncidents(data){
                VueUtil(this).cb(data).success(() => {
                    switch (data.type) {
                        case 'gotoByIncidentsNumber':
                                if(this.position === 'top'){
                                    if (data.data.list.length === 1) {
                                        this.$router.push(`/incidents/${data.data.list[0].id}`);
                                    } else {
                                        this.$Message.warning('Access Denied');
                                    }
                                }
                            break;
                        case 'manage':
                                this.modal.snooze = false;
                            break;
                    }
                }).error();
            },

            listenType(type){
                this.clearSelect();
            },
            openReAssign(){
                this.modal.reAssign = true;
            },
        },

        mounted(){

        },
        watch: {
            'Incidents.gotoByIncidentsNumber': "listenIncidents",
            'Incidents.manage': "listenIncidents",
            "type": "listenType",
        },
        props: [
            'permission',
            'total',
            'current',
            'changePage',
            'changePageSizer',
            'pageSize',
            'selectRows',
            'assignedTo',
            'position',
        ],
        data(){
            return {
                modal:{
                    merge: false,
                    reAssign:false ,
                    snooze:false ,
                },
                search:{
                    incident_number: null,
                },

                loading: false,

                newIncidents: {},
                selector: false,
            }
        }
    }
</script>
