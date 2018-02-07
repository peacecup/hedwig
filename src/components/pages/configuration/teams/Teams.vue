<template>
    <div>
        <Row type="flex">
            <Col span="20">
            <Row type="flex" style="width: 100%;border-bottom: 1px solid #e9eaec">
                <Col span="16">
                <h1>{{ $t('h.teams') }}</h1>
                </Col>
                <Col span="8">
                <div style="text-align: right">
                    <Form ref="queryForm" :model="query" onSubmit="return false;">
                        <Input icon="search" :maxlength="30" v-model="query.name" placeholder="Search..."
                               style="width: 200px"/>
                        <Button style="display: none" htmlType="submit" @click="changePage(1)" icon="search"></Button>
                    </Form>
                </div>
                </Col>
            </Row>
            <Row>
                <Col span="24">
                <div style="float: right;">
                    <Page :page-size="query.limit" :total="Teams.list.data.total" :current="Teams.list.data.offset"
                          size="small"
                          @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                          show-sizer></Page>
                </div>
                </Col>
                <Col span="24">
                <Table @on-sort-change="sortChange" size="small" :columns="columns" :data="Teams.list.data.list"
                       :loading="tableLoading"></Table>
                </Col>
                <Col span="24">
                <div style="float: right;">
                    <Page :page-size="query.limit" :total="Teams.list.data.total" :current="Teams.list.data.offset"
                          size="small"
                          @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                          show-sizer></Page>
                </div>
                </Col>
            </Row>
            </Col>
            <Col span="4">
            <Card>
                <p slot="title">
                    Invite your team
                </p>
                <Button v-key="`team.new`" @click="openModal" style="width:100%; text-align: left" icon="plus"
                        type="success">{{ I18n('add teams') }}

                </Button>
            </Card>

            <Modal width="600px" v-model="modal" :title="modalTitle"
                   :loading="loading" :mask-closable="false"
                   @on-ok="saveTeams">
                <DynamicForm :dicts="dicts" :button="button" ref="form" :editFields="editFields" :submit="saveTeams" :labelWidth="120"
                             :ruleValidate="ruleValidate"
                             :formValidate="formValidate"></DynamicForm>
                <div slot="footer">
                    <Button size="large" @click="resetForm" v-if="showReset">{{ $t('button.reset')}}</Button>
                    <Button size="large" :disabled="loading" @click="modal = false">{{ $t('button.cancel')}}</Button>
                    <Button type="primary" size="large" :loading="loading" @click="saveTeams" htmlType="submit">
                        {{ $t('button.submit')}}

                    </Button>
                </div>
            </Modal>
            </Col>
        </Row>
    </div>

</template>
<script>
    import {VueUtil, FormUtil} from '@util';
    import _ from 'lodash';
    import DropMenuDecorator from '@common/DropMenuDecorator.vue';

    export default {
        components: {},
        computed: {
            ...VueUtil(this).select(['Teams', 'Users', 'EscalationPolicies']).state(),
            showReset(){
                return this.modalType == "edit";
            },
            modalTitle(){
                return this.modalType.toUpperCase() + " Team";
            }
        },

        methods: {
            ...VueUtil(this).select(['Teams', 'Users', 'EscalationPolicies']).actions(),
            I18n(key) {
                return VueUtil(this).I18n(key);
            },
            openModal(){
                this.modalType = "add";
                this.modal = true;
                this.loading = false;
            },
            resetForm(){
                this.formValidate = _.cloneDeep(this.old_TeamValue);
            },
            saveTeams(){
                this.loading = true;
                this.$refs['form'].validate({
                    ok: (data) => {
                        //界面显示 保存数据的时候不会突然刷白
                        let tempData = _.cloneDeep(data);
                        if (!!data.id && data.id !== '') {
                            VueUtil(this).select('Teams').update(tempData, proxy => {
                                let escalationPolicies = _.map(this.formValidate.escalationPolicies,
                                    id => {
                                        return {id: id}
                                    });
                                let users = _.map(this.formValidate.users, id => {
                                    return {id: id}
                                })
                                proxy.escalationPolicies = escalationPolicies;
                                proxy.users = users;
                                return proxy;
                            });
                        }
                        else
                            VueUtil(this).select('Teams').save(tempData, proxy => {
                                let escalationPolicies = _.map(this.formValidate.escalationPolicies,
                                    id => {
                                        return {id: id}
                                    });
                                let users = _.map(this.formValidate.users, id => {
                                    return {id: id}
                                })
                                proxy.escalationPolicies = escalationPolicies;
                                proxy.users = users;
                                return proxy;
                            });
                    }, err: () => {
                        this.loading = false;
                    }
                });
            },
            btnClick(){
                this.$router.push(this.addBtn.path);
            },

            deleteTeams(id){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select('Teams').delete(id);
                    }
                });
            },
            sortChange({key, order}){
                this.query = {...this.query, sortField: key, sortOrder: order};
                this.changePage();
            },
            changePage(page){
                page ? this.query.offset = page : null;
                this.tableLoading = true;
                VueUtil(this).select('Teams').list(this.query);
            },
            changePageSizer(pageSize){
                this.query.limit = pageSize;
                this.tableLoading = true;
                VueUtil(this).select('Teams').list(this.query);
            },
            operate(id){
                var $id = id.split("/");
                switch ($id[0]) {
                    case 'view':
                        this.$router.push(`/teams/${$id[1]}/detail`);
                        break;
                    case 'edit':
                        VueUtil(this).select('Teams').get({
                            id: _.parseInt($id[1]),
                            includes: ['users', 'escalationPolicies'],
                        });
                        break;
                    case 'delete':
                        this.deleteTeams(_.parseInt($id[1]));
                        break;
                }
            },
            listenTeams(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'list') {
                        this.tableLoading = false;
                    } else if (data.type === 'all') {
                        let es_ids = [];
                        _.forEach(this.Teams.all.data.list, e => {
                            _.forEach(e.escalationPolicies, es => {
                                es_ids.push(es.id);
                            });
                        })
                        this.es_ids = es_ids;
                        if (_.isEmpty(this.EscalationPolicies.all.data)) {
                            VueUtil(this).select('EscalationPolicies').action('all');
                        } else {
                            this.initDict_es(this.EscalationPolicies.all.data.list);
                        }
                    } else if (data.type === 'get') {
                        this.formValidate = data.data;
                        if (!Array.isArray(this.formValidate.escalationPolicies)) {
                            this.formValidate.escalationPolicies = [];
                        } else {
                            this.formValidate.escalationPolicies = _.map(this.formValidate.escalationPolicies,
                                escalationPolicy => escalationPolicy.id
                            )
                        }
                        if (!Array.isArray(this.formValidate.users)) {
                            this.formValidate.users = [];
                        } else {
                            this.formValidate.users = _.map(this.formValidate.users,
                                user => user.id
                            )
                        }
                        this.old_TeamValue = _.cloneDeep(this.formValidate);
                        this.openModal();
                        this.modalType = "edit";
                    } else {
                        this.$Message.success(`${data.type} success!`);
                        this.modal = false;
                        this.changePage();
                        VueUtil(this).select('Teams').action('all')
                    }
                }).error();
            },
            listenUsers(all){
                VueUtil(this).cb(all).success(() => {
                    let dict_users = _.map(all.data.list, user => {
                        return {
                            value: user.id,
                            label: user.name
                        }
                    });
                    this.$set(this.dicts, 'users', dict_users)
                });
            },
            initDict_es(es_all){
                let dict_es = _.map(es_all, e => {
                    let disabled = _.includes(this.es_ids, e.id);
                    return {label: e.name, value: e.id, disabled: disabled};
                });
                this.$set(this.dicts, 'escalationPolicies', dict_es)
            },
            listenEscalationPolicies(all){
                VueUtil(this).cb(all).success(() => {
                    this.initDict_es(all.data.list);
                });
            },
            listenModal(modal){
                if (!modal) {
                    this.$refs['form'].handleReset('formValidate');
                } else {
                    VueUtil(this).select('Users').action('all').select('EscalationPolicies').action('all');
                }
            }
        }
        ,
        watch: {
            'Teams.list': 'listenTeams',
            'Teams.get': 'listenTeams',
            'Teams.all': 'listenTeams',
            'Teams.delete': 'listenTeams',
            'Teams.save': 'listenTeams',
            'Teams.update': 'listenTeams',
            'Users.all': 'listenUsers',
            'EscalationPolicies.all': 'listenEscalationPolicies',
            'modal': 'listenModal',
        },
        destroyed(){
            VueUtil(this).select('Teams').clear(['list']);
        },
        // 挂载完毕请求数据
        mounted(){
            if (this.changePage) this.changePage(1);

        },
        data(){
            let fields = [
                {
                    id: 'id',
                    type: 'hidden',
                },
                {
                    label: 'Name',
                    id: 'name',
                    type: 'input',
                    width: "80%",
                    rules: [{required: true, message: this.$t('valid.required')},
                        {validator: FormUtil(this).validator.noSpecialWord, trigger: 'blur'},
                    ],
                    span: 24,
                    formIndex: 1,
                    render: (h, params) => {
                        return h('router-link', {
                            props: {
                                to: "/teams/" + params.row.id + "/detail",
                            }
                        }, params.row.name)
                    }
                }, {
                    label: 'Escalation Policy',
                    id: 'escalationPolicies',
                    type: 'select',
                    multiple: true,
                    filterable: true,
                    scope: ["form"],
                    clearable: true,
                    span: 24,
                    formIndex: 2
                }, {
                    label: 'Users',
                    id: 'users',
                    type: 'select',
                    multiple: true,
                    filterable: true,
                    scope: ["form"],
                    clearable: true,
                    span: 24,
                    formIndex: 2
                },
            ];
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            let query = formUtil.defaultQuery();
            const rowMenuList = [
                {title: "view", icon: "search", type: 'view'},
                {title: "edit", icon: "edit", type: 'edit'},
                {title: "delete", icon: "trash-a", type: 'delete'},
            ]
            return {
                query,
                es_ids: [],
                dicts: {
                    escalationPolicies: [],
                    users: [],
                },
                modal: false,
                loading: false,
                modalType: "add",
                tableLoading: true,
                button: {
                    enable: false,
                },
                addBtn: {title: "Add New Teams", path: '/service/add',},
                editFields: formUtil.editFields(),
                queryFields: formUtil.queryFields(),
                formValidate: formUtil.forms(),
                ruleValidate: formUtil.rules(),
                columns: [
                    ...formUtil.columns(),
                    {
                        key: 'id',
                        render: (h, params) => {
                            return h(DropMenuDecorator, {
                                props: {
                                    id: params.row.id,
                                    select: this.operate,
                                    title: 'Operate',
                                    list: rowMenuList,
                                }
                            })
                        }
                    }
                ],

            }
        }
    }
</script>