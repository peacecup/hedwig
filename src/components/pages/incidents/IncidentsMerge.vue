<template>
    <Modal width="600px" v-model="value" :title="I18n('merge incidents')"
           :loading="loading" :mask-closable="false"
           @on-ok="merge"
    >
        <Form>
            <p>The alerts of the selected incidents will be merged into a single incident.</p>
            <div style="margin-bottom: 10px;">
                <Radio-group v-model="type">
                    <p>
                        <Radio :label="1">Select an open incident</Radio>
                    </p>
                    <p>
                        <Radio :label="2">Find by incident number</Radio>
                    </p>
                </Radio-group>
            </div>
            <div v-if="type === 1" style="margin-bottom: 10px;">
                <Input readonly v-model="selects.title" icon="search" placeholder="Search for objects"
                       @on-focus="selectorFocus"/>
                <div v-if="selector" style="border: 1px solid #e9eaec;">
                    <SelectIncidents :selectCb="selectCb"
                                     :selects="selects"
                                     :loading="Incidents.all.loading"
                                     :incident1="incident_all"
                                     :incident2="incident_tome"
                                     :incident3="incident_tomyteam"></SelectIncidents>
                </div>
            </div>
            <div v-if="type === 2" style="margin-bottom: 10px;">
                <Form ref="queryForm" :model="selects" onSubmit="return false;">
                    <Input :maxlength="30" v-model="selects.incident_number" placeholder="please input incidents number"
                           style="width: 300px;"/>
                    <Button htmlType="submit" @click="getIncidentByNumber" icon="ios-search"></Button>
                </Form>
            </div>
            <div style="margin-bottom: 10px;">
                The remaining selected incidents will be resolved after the merge is complete.






            </div>
            <div v-if="!!selects.title" style="margin-bottom: 10px;">
                <h2>Incident Title</h2>
                <Input v-model="newIncidents.title"/>
                <div style="padding: 10px">
                    <Row>
                        <Col span="12">
                        {{I18n('name')}} : {{selects.title}}
                        </Col>
                        <Col span="12"></Col>
                    </Row>
                    <Row>
                        <Col span="12">
                        {{I18n('status')}} : {{selects.status}}
                        </Col>
                        <Col span="12">
                        {{I18n('service')}} :

                        <router-link :to="`/services/${_.get(selects,'service.id',null)}/detail`">
                            {{_.get(selects, 'service.summary', null)}}

                        </router-link>
                        </Col>
                    </Row>
                    <Row>
                        <Col span="12">
                        {{I18n('assignedto')}} :

                        <router-link :to="`/users/${_.get(selects,'assignments[0].assignee.id',null)}`">
                            {{_.get(selects, 'assignments[0].assignee.summary', null)}}

                        </router-link>
                        </Col>
                        <Col span="12">
                        {{I18n('created')}} : {{moment(selects.created_at).format($t('date.MDTime'))}}
                        </Col>
                    </Row>
                </div>
            </div>
        </Form>
        <div slot="footer">
            <Button size="large" :disabled="Incidents.merge.loading"
                    @click="$emit('input',false)">{{ $t('button.cancel')}}</Button>
            <Button type="primary" size="large" :loading="Incidents.merge.loading" :disabled="!selects.title"
                    @click="merge">{{ $t('button.submit')}}</Button>
        </div>
    </Modal>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import store from 'store';
    import SelectIncidents from './SelectIncidents';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'IncidentsMerge',
        components: {SelectIncidents},
        computed: {
            ...VueUtil(this).select(['Incidents', 'Users']).state(),
        },
        props: {
            value: {
                type: Boolean
            },
            incidents: {
                type: Array
            }
        },

        data(){
            return {
                type: 1,
                selects: {},
                selector: false,
                loading: false,
                incident_all: [],
                incident_tome: [],
                incident_tomyteam: [],
                newIncidents: {},
            }
        },
        mounted(){


        },
        watch: {
            'Incidents.all': "listenIncidents",
            'Incidents.assignToMe': "listenIncidents",
            'Incidents.assignToMyTeam': "listenIncidents",
            'Incidents.getByIncidentsNumber': "listenIncidents",
            'Incidents.merge': "listenIncidents",
            value(val){
                if (val) {
                    this.loadingIncidentsInfo();
                }else{
                    this.selects = {};
                    this.selector = false;
                    this.type = 1;
                }
                this.$emit('input', val);
            },
        },
        methods: {
            ...VueUtil(this).select(['Incidents', 'Users']).actions(),
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            getInclude(){
                return {include: ['services', 'assignees']};
            },
            getOrder(){
                return {sortField: 'incident_number', sortOrder: 'desc',};
            },
            selectorFocus(){
                this.selector = true;
            },
            loadingIncidentsInfo(){
                const include = this.getInclude();
                const order = this.getOrder();
                const teams_ids = _.map(_.get(this, "Users.me.data.teams", []), team => team.id);
                VueUtil(this).select('Incidents').action('all', {
                    ...include,
                    ...order,
                }).action('assignToMe', {
                    ...include,
                    ...order,
                    user_ids: store.get("id"),
                }).action('assignToMyTeam', {
                    ...include,
                    ...order,
                    teams_ids: teams_ids,
                });
            },
            getIncidentByNumber(event){

                if (event.keyCode === 13 && this.validNumber(this.search.incident_number)) {
                    VueUtil(this).select('Incidents').action('gotoByIncidentsNumber', {incident_number: this.search.incident_number, ...this.getInclude()});
                }
                if (_.isUndefined(event.keyCode) && this.validNumber(this.selects.incident_number)) {
                    if (!this.validNumber(this.selects.incident_number)) {
                        return;
                    }
                    VueUtil(this).select('Incidents').action('getByIncidentsNumber', {incident_number: this.selects.incident_number, ...this.getInclude()});
                }
                return false;
            },
            listenIncidents(data){
                VueUtil(this).cb(data).success(() => {
                    switch (data.type) {
                        case 'all':
                            let all = [];
                            _.forEach(data.data.list, incident => {
                                for (let i in this.incidents) {
                                    if (incident.service.id === this.incidents[i].service.id) {
                                        all.push(incident);
                                        break;
                                    }
                                }
                            })
                            this.incident_all = all;
                            break;
                        case 'assignToMe':
                            this.incident_tome = data.data.list;
                            break;
                        case 'assignToMyTeam':
                            this.incident_tomyteam = data.data.list;
                            break;
                        case 'getByIncidentsNumber':
                            if (data.data.list.length === 1) {
                                this.selectCb(data.data.list[0]);
                            } else {
                                this.selectCb({incident_number: this.selects.incident_number});
                            }
                            break;
                        case 'merge':
                            this.$emit('input', false);
                            break;
                    }
                }).error();
            },
            validNumber(number){
                if (!/^[0-9]*$/.test(number)) {
                    this.$Message.warning('please input a number!');
                    return false;
                } else {
                    return true;
                }
            },
            selectCb(incidents){
                this.selects = incidents;
                this.newIncidents = _.cloneDeep(incidents);
                this.selector = false;
            },
            clearSelect(){
                this.selects = {};
                this.newIncidents = {};
            },
            merge(){
                if(this.newIncidents.title === '') {
                    this.$Message.error('title is not null!');
                    return;
                }
                let mergeData = {
                    'source_incidents': _.map(this.incidents, row => {
                        return {id: row.id}
                    }),
                    'id': this.selects.id,
                    'title': this.newIncidents.title,
                }
                VueUtil(this).select('Incidents').action('merge', mergeData);
            },
        }
    }
</script>