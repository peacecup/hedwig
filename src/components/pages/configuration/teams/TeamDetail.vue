<template>
    <div class="team-detail">
        <Row>
            <Col span="20">
                <div><h1>{{Teams.get.data.name}}</h1></div>
                <div class="divider" style="margin-bottom: 10px;"></div>
                <Tabs :animated="false">
                    <Tab-pane :label="I18n('users')">
                        <TeamUsers :team="Teams.get.data"></TeamUsers>
                    </Tab-pane>
                    <Tab-pane :label="I18n('schedules')">
                        <TeamSchedules :team="Teams.get.data"></TeamSchedules>
                    </Tab-pane>
                    <Tab-pane :label="I18n('escalation policies')">
                        <TeamPolicies :team="Teams.get.data" @escaPolicyChange="escaPolicyChange"></TeamPolicies>
                    </Tab-pane>
                    <Tab-pane :label="I18n('services')">
                        <TeamServices :team="Teams.get.data"></TeamServices>
                    </Tab-pane>
                </Tabs>
            </Col>
            <Col span="4">
                <Button class="text-align-left" style="width:100%;" icon="edit" @click="openModal">{{ I18n('edit teams') }}</Button>
                <Modal width="600px" v-model="modal" :title="modalTitle"
                       :loading="loading"
                       :mask-closable="false"
                       @on-ok="saveTeams">
                    <DynamicForm :dicts="dicts" :button="{enabled:false}" ref="form" :editFields="fields"
                                 :ruleValidate="ruleValidate"
                                 :formValidate="formValidate"></DynamicForm>
                    <div slot="footer">
                        <Button size="large" @click="resetForm">{{ $t('button.reset')}}</Button>
                        <Button type="primary" size="large" :loading="loading" @click="saveTeams">{{ $t('button.submit')}}</Button>
                    </div>
                </Modal>
            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';
    import TeamUsers from './TeamUsers';
    import TeamSchedules from './TeamSchedules';
    import TeamPolicies from './TeamPolicies';
    import TeamServices from './TeamServices';

    export default{
        name: 'TeamDetail',
        components: {
            TeamUsers,TeamSchedules,TeamPolicies,TeamServices
        },
        computed: {
            ...VueUtil(this).select(['Teams','EscalationPolicies','Users']).state(),
        },
        methods: {
            ...VueUtil(this).select(['Teams','EscalationPolicies','Users']).actions(),
            I18n(key) {
              return VueUtil(this).I18n(key);
            },
            listenTeams(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'all'){
                        let es_ids = [];
                        _.forEach(this.Teams.all.data.list, e => {
                            _.forEach(e.escalationPolicies, es => {
                                es_ids.push(es.id);
                            });
                        })
                        this.es_ids = es_ids;
                        if(_.isEmpty(this.EscalationPolicies.all.data)){
                            VueUtil(this).select('EscalationPolicies').action('all');
                        }else{
                            this.initDict_es(this.EscalationPolicies.all.data.list);
                        }
                    }
                    else if (data.type === 'get') {
                        this.formValidate = _.cloneDeep(data.data);
                        if(!Array.isArray(this.formValidate.escalationPolicies)){
                            this.formValidate.escalationPolicies = [];
                        }else{
                            this.formValidate.escalationPolicies = _.map(this.formValidate.escalationPolicies,
                                escalationPolicy => escalationPolicy.id
                            )
                        }
                        if(!Array.isArray(this.formValidate.users)){
                            this.formValidate.users = [];
                        }else{
                            this.formValidate.users = _.map(this.formValidate.users,
                                user => user.id
                            )
                        }
                        this.old_TeamValue = _.cloneDeep(this.formValidate);
                    } else {
                        this.$Message.success(`${data.type} success!`);
                        this.modal = false;
                        //修改成功以后更新数据
                        VueUtil(this).select("Teams").get(this.$route.params.id);
                        //使用sertimeout注册宏任务让代按照需要的顺序执行
                        VueUtil(this).select("Teams").action('all');
                    }
                }).error();
            },
            openModal(){
                this.modalTitle = "Edit Teams";
                this.modal = true;
                this.loading = false;
            },
            resetForm(){
                this.formValidate = _.cloneDeep(this.old_TeamValue);
            },
            escaPolicyChange(){
                VueUtil(this).select("Teams").get(this.$route.params.id);
            },
            saveTeams(){
                this.loading = true;
                this.$refs['form'].validate({
                    ok: (data) => {
                        //界面显示 保存数据的时候不会突然刷白
                        let tempData = _.cloneDeep(data);
                        VueUtil(this).select('Teams').update(tempData,proxy => {
                            let escalationPolicies = _.map(this.formValidate.escalationPolicies,
                                id => { return {"id" : id}});
                            let users = _.map(this.formValidate.users,id => { return {"id" : id}})
                            proxy.escalationPolicies = escalationPolicies;
                            proxy.users = users;
                            return proxy;
                        });
                    }, err: () => {
                        this.loading = false;
                    }
                });
            },
            listenUsers(all){
                VueUtil(this).cb(all).success(() => {
                    this.dicts.users = _.map(all.data.list, user => {
                        return {
                            value: user.id,
                            label: user.name
                        }
                    });
                });
            },
            initDict_es(es_all){
                let dict_es = _.map(es_all, e => {
                    let disabled = _.includes(this.es_ids,e.id);
                    return {label: e.name, value: e.id,disabled:disabled};
                });
                this.$set(this.dicts,'escalationPolicies',dict_es)
            },
            listenEscalationPolicies(all){
                VueUtil(this).cb(all).success(() => {
                    this.initDict_es(all.data.list);
                });
            }
        },
        props: {},
        data(){
            let fields = [
                {
                    id: 'id',
                    type: 'hidden'
                },
                {
                    label: 'Name',
                    id: 'name',
                    type: 'input',
                    sortable: 'custom',
                    width: "80%",
                    rules: [{required: true}],
                    span: 24,
                    formIndex: 1
                }, {
                    label: 'Escalation Policies',
                    id: 'escalationPolicies',
                    type: 'select',
                    multiple: true,
                    filterable: true,
                    options: 'escalationPolicies',
                    scope: ["form"],
                    clearable: true,
                    sortable: 'custom',
                    span: 24,
                    formIndex: 2
                }, {
                    label: 'Users',
                    id: 'users',
                    type: 'select',
                    multiple: true,
                    filterable: true,
                    options: 'users',
                    scope: ["form"],
                    clearable: true,
                    sortable: 'custom',
                    span: 24,
                    formIndex: 2
                },
            ];
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            let query = formUtil.defaultQuery();
            const dicts = {
                escalationPolicies: [],
                users: [],
            };
            return {
                query,
                es_ids:[],
                dicts,
                modal: false,
                loading: false,
                modalTitle: "",
                addBtn: {title: "Add New Teams", path: '/service/add',},
                fields: formUtil.editFields(),
                queryFields: formUtil.queryFields(),
                formValidate: formUtil.forms(),
                ruleValidate: formUtil.rules(),
                old_TeamValue:{}
            }
        },
        mounted(){
            VueUtil(this).select('Teams').action('all').select('Users').action('all');
            VueUtil(this).select("Teams").get(this.$route.params.id);
        },
        watch: {
            'Teams.get':'listenTeams',
            'Teams.all':'listenTeams',
            'Teams.update':'listenTeams',
            'Users.all': 'listenUsers',
            'EscalationPolicies.all': 'listenEscalationPolicies'
        }
    }
</script>