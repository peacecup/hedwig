<template>
    <div>
        <Row type="flex">
            <Col span="20">
            <Row type="flex" style="width: 100%;border-bottom: 1px solid #e9eaec">
                <Col span="16">
                <h1>{{title}}</h1>
                </Col>
                <Col span="8">
                <div style="text-align: right">
                    <Form ref="queryForm" :model="query" onSubmit="return false;">
                        <Input icon="search" :maxlength="30" v-model="query.query" placeholder="Search..."
                               style="width: 200px"/>
                        <Button style="display: none" htmlType="submit" @click="changePage(1)" icon="search"></Button>
                    </Form>
                </div>
                </Col>
            </Row>
            <Row>
                <Col span="24">
                <div style="float: right;">
                    <Page :page-size="query.limit" :total="Users.list.data.total" :current="Users.list.data.offset"
                          size="small" @on-change="changePage" @on-page-size-change="changelimit" show-total
                          show-sizer></Page>
                </div>
                </Col>

                <Col span="24">
                <Table @on-sort-change="sortChange" size="small" :columns="columns" :data="Users.list.data.list"
                       :loading="Users.list.loading"></Table>
                </Col>
                <Col span="24">
                <div style="float: right;">
                    <Page :page-size="query.limit" :total="Users.list.data.total" :current="Users.list.data.offset"
                          size="small" @on-change="changePage" @on-page-size-change="changelimit" show-total
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
                <Button v-key="`user.add`" @click="openModal" style="width:100%; text-align: left" icon="plus" type="success">{{ I18n('add users')}}


                </Button>
            </Card>
            <Modal width="600px" v-model="modal" :mask-closable="false" :title="modalTitle" :loading="loading" @on-ok="saveUsers" >
                <DynamicForm :dicts="dicts" :button="{enabled:false}" :submit="saveUsers" ref="form"
                             :editFields="editFields" :ruleValidate="ruleValidate"
                             :formValidate="formValidate"></DynamicForm>
                <div slot="footer">
                    <Button size="large" @click="resetForm">{{ $t('button.reset')}}</Button>
                    <Button size="large" :disabled="loading" @click="modal = false">{{ $t('button.cancel')}}</Button>
                    <Button type="primary" size="large" :loading="loading" @click="saveUsers">{{ $t('button.submit')}}</Button>
                </div>
            </Modal>
            </Col>

        </Row>
    </div>

</template>
<script>
    import {VueUtil, FormUtil} from '@util';
    import DropMenuDecorator from '@common/DropMenuDecorator.vue';
    export default {
        components: {},
        computed: {
            ...VueUtil(this).select(['Users', 'Teams']).state(),
        },
        methods: {
            ...VueUtil(this).select(['Users', 'Teams']).actions(),
            I18n(key){
              return VueUtil(this).I18n(key);
            },
            openModal() {
                this.modalTitle = "Add Users";
                this.modal = true;
                this.loading = false;
                VueUtil(this).select('Teams').list();
            },
            saveUsers() {
                this.loading = true;
                this.$refs['form'].validate({
                    ok: (data) => {
                        if (!!data.id && data.id !== '')
                            VueUtil(this).select('Users').update(data, this.beforeSave);
                        else
                            VueUtil(this).select('Users').save(data, this.beforeSave);
                    },
                    err: () => {
                        this.loading = false;
                    }
                });
            },
            beforeSave(user) {
                user.teams = _.map(user.teams, t => {
                    return {id: t};
                });
                return user;
            },
            resetForm() {
                let id = this.formValidate.id;
                this.$refs['form'].handleReset('formValidate');
                this.formValidate.id = id;
            },
            btnClick() {
                this.$router.push(this.addBtn.path);
            },

            deleteUsers(id) {
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select('Users').delete(id);
                    }
                });
            },
            updateUsers(user) {
                VueUtil(this).select('Users').update(user);
            },
            sortChange({key, order}) {
                this.query = {...this.query, sortField: key, sortOrder: order};
                this.changePage();
            },
            changePage(page) {
                page ? this.query.offset = page : null;
                VueUtil(this).select('Users').list({...this.query, include: 'teams'});
            },
            changelimit(limit) {
                this.query.limit = limit;
                VueUtil(this).select('Users').list(this.query);
            },
            listenUsers(data) {
                if (data.type === 'get') {
                    this.formValidate = data.data;
                } else {
                    VueUtil(this).cb(data).success(() => {
                        setTimeout(() => {
                            this.modal = false;
                            this.changePage();
                        }, 600);
                    }).error();
                }
            },
            listenTeams(data) {
                VueUtil(this).cb(data).success(() => {
                    this.dicts.Teams = _.map(data.data.list, t => {
                        return {value: t.id, label: t.name}
                    });
                })
            },
            listenModal(modal) {
                if (!modal) {
                    this.$refs['form'].handleReset('formValidate');
                }
            },
            operate(id) {
                var $id = id.split("/");
                switch ($id[0]) {
                    case 'view':
                        this.$router.push(`/users/${$id[1]}`);
                        break;
                    case 'edit':
                        VueUtil(this).select('Users').get($id[1]);
                        this.openModal();
                        break;
                    case 'delete':
                        this.deleteUsers($id[1]);
                        break;
                }
            },
            listenChooseTeams(team) {
                if (_.get(team, 'data.id', null)) {
                    this.query.team_ids = [team.data.id];
                    this.title = `Users on ${team.data.name}`;
                } else {
                    this.query.team_ids = null;
                    this.title = `Users on All Teams`;
                }
                this.changePage(1);
            }
        },
        watch: {
            'Users.get': 'listenUsers',
            'Users.delete': 'listenUsers',
            'Users.save': 'listenUsers',
            'Users.update': 'listenUsers',
            'Teams.list': 'listenTeams',
            'modal': 'listenModal',
            'Teams.choose': 'listenChooseTeams'
        },
        destroyed(){
          VueUtil(this).select('Users').clear(['list','get']);
        },
        // 挂载完毕请求数据
        mounted() {
            this.listenChooseTeams(this.Teams.choose);
            this.changePage(1);
        },
        data() {
            const rouleNameMapping = new Map([
                ['admin', 'Gloable Admin'],
                ['limited_user', 'Responder'],
                ['observer', 'Observer'],
                ['owner', 'Account Owner'],
                ['read_only_user', 'Stakeholder'],
                ['restricted_access', 'Restricted Access'],
                ['team_responder', 'Team Responder'],
                ['user', 'Manager'],
                ['manager', 'Manager'],
                ['observer', 'Observer'],
                ['responder', 'Responder']
            ]);
            const fields = [{
                id: 'id',
                type: 'hidden',
                scope: ['form'],
            },
                {
                    label: 'Name',
                    id: 'name',
                    type: 'input',
                    maxlength: 20,
                    render: (h, params) => {
                        return h('div', [
                            h('span', {
                                style: {
                                    marginRight: '20px',
                                    padding: '10px',
                                    background: params.row.color
                                }
                            }),
                            h('router-link', {
                                props: {
                                    to: `/users/${params.row.id}`
                                }
                            }, params.row.name),
                        ]);
                    },
                    rules: [
                        {required: true, message: this.$t('valid.required')},
                        {validator: FormUtil(this).validator.noSpecialWord, trigger: 'blur'},
                    ],
                    span: 22,
                }, {
                    label: 'Email',
                    id: 'email',
                    type: 'input',
                    rules: [{type: "email", message: this.$t('valid.email')}],
                    span: 22,
                    render: (h, params) => {
                        if(params.row.email)
                            return <a href={`mailto:${params.row.email}`}>{`${params.row.email}`}</a>;
                        else
                            return "";
                    }
                }, {
                    label: 'jobtitle',
                    id: 'job_title',
                    type: 'input',
                    scope: ["column"],
                    span: 22,
                }, {
                    label: 'Role',
                    id: 'role',
                    type: 'select',
                    options: 'roles',
                    rules: [
                        {required: true, message: this.$t('valid.required')},
                    ],
                    span: 22,
                    render: (h, params) => {
                        var rouleName = rouleNameMapping.get(params.row.role);
                        return h('p', rouleName);
                    }
                }, {
                    label: 'Teams',
                    id: 'teams',
                    type: 'select',
                    options: 'Teams',
                    filterable: true,
                    multiple: true,
                    scope: ["column"],
                    span: 22,
                    render: (h, params) => {
                        return h('div', _.map(params.row.teams, (team, index) => {
                            return h('p', {
                                style: {
                                    //borderTop: index !== 0 ? '1px solid #e9eaec' : 'none',
                                    lineHeight: '30px',
                                }
                            }, [h('router-link', {
                                props: {to: `/teams/${team.id}/detail`}
                            }, team.summary)])
                        }));
                    }
                }, {
                    label: 'Color',
                    id: 'color',
                    type: 'color',
                    defaultValue: '#47cb89',
                    scope: ['form'],
                    span: 22,
                }
            ];
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            const query = {
                ...formUtil.defaultQuery(),
                query: ""
            };
            const rowMenuList = [
                {title: "view", icon: "search", type: 'view'},
                {title: "delete", icon: "trash-a", type: 'delete', key:'user.del'},
            ]
            const dicts = {
                roles: [
//                    {value: "owner",label:"Account Owner"},
                    {value: "admin", label: "Gloable Admin"},
                    {value: "user", label: "Manager"},
                    {value: "limited_user", label: "Responder"},
                    {value: "team_responder",label:"Team Responder"},
                    {value: "observer", label: "Observer"},
                    {value: "read_only_user",label:"Stakeholder"},
                    {value: "restricted_access",label:"Restricted Access"},
                ],
                Teams: [],
            }
            return {
                query,
                dicts,
                modal: false,
                loading: false,
                modalTitle: '',
                title: 'Users on My Teams',
                tab: 'Users',
                addBtn: {title: "Add New Users", path: '/service/add',},
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
                                    id : params.row.id,
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