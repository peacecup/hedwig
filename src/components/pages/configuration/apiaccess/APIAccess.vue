<template>
    <div class="api-access">
        <Row>
            <Col span="24">
            <h1>API Access Keys</h1>
            <div class="divider"></div>
            </Col>
            <Col span="24">
            <Alert>API Access Keys are at the account level. Only admins have access to them.<br/>
Users who don't have admin access can still create API User Tokens from their user settings page. These are tied to the user account, with the same level of permissions access.

            </Alert>
            </Col>
            <Col span="24">
            <Button type="success" icon="plus" @click="openModal">Create New Api key</Button>
            </Col>
            <Col span="24">
            <Table @on-sort-change="sortChange" size="small" :columns="columns"
                   :data="APIAccess.list.data.list"></Table>
            </Col>
            <Col span="24">
            <div style="float: right;">
                <Page :page-size="query.limit" :total="APIAccess.list.data.total" :current="APIAccess.list.data.offset"
                      size="small"
                      @on-change="changePage" @on-page-size-change="changeLimit" show-total
                      show-sizer></Page>
            </div>
            </Col>
        </Row>
        <APIAccessEditForm ref="apiaccessEditForm"></APIAccessEditForm>
    </div>
</template>

<script>
    import {VueUtil, FormUtil} from '@util';
    import APIAccessEditForm from './APIAccessEditForm.vue';

    export default{
        name: 'APIAccess',
        components: {APIAccessEditForm},
        computed: {
            ...VueUtil(this).select(['APIAccess']).state(),
        },
        props: {},

        data(){
            const fields = [{
                id: 'id',
                type: 'hidden',
            }, {
                label: 'API Key',
                id: 'apiTokenKey'

            },
            {
                label: 'Description',
                id: 'description',
            },
            {
                label: 'Created',
                id: 'createTime',
            }, {
                label: 'Last Used',
                id: 'lastUseTime',
                render: (h, params) => {
                    var userTime = params.lastUseTime || 'Never'
                    return h('p', userTime);
                }
            }, {
                label:'Access Level',
                id:'accessLevel'
            },{
                label:'Disabled'
            },{
                label: '',
                render: (h, params) => {
                    var keyState = "enabled";
                    if (params.row.keyState==="enabled") {
                        keyState = "disabled";
                    }
                    return h('div', [
                            h('a', {
                                on: {
                                    click: () => {
                                        this.$Modal.confirm({
                                            title: 'Confirm',
                                            content: '<p>Are you sure you want to disable this API Token?<br></p>Incidents from monitoring tools connecting to this integration will no longer be created.',
                                            onOk: () => {
                                                VueUtil(this).select('APIAccess').update({
                                                    id: params.row.id,
                                                    keyState: keyState
                                                })
                                            }
                                        });
                                    }
                                }
                            }, keyState),
                            h('br', {}),
                            h('a', {
                                on: {
                                    click: () => {
                                        this.$Modal.confirm({
                                            title: 'Confirm',
                                            content: '<p>Are you sure?Any script using this key will no longer be able to connect to Hedwing!</p>',
                                            onOk: () => {
                                                VueUtil(this).select('APIAccess').delete({
                                                    id: params.row.id
                                                })
                                            }
                                        });
                                    }
                                }

                            }, 'remove')
                        ]

                    )
                }

            }
        ];
            let formUtil = FormUtil(this).initFields(fields);
            return {
                modal: false,
                query: formUtil.defaultQuery(),
                queryFields: formUtil.queryFields(),
                ruleValidate: formUtil.rules(),
                columns: [
                    ...formUtil.columns()
                ],
            }
        },
        mounted(){
            this.changePage(1);
        },
        watch: {
            "APIAccess.save": "listenAPIAccess",
            "APIAccess.update": "listenAPIAccess",
            "APIAccess.delete": "listenAPIAccess"
        },
        methods: {
            ...VueUtil(this).select(['APIAccess']).actions(),
            openModal(){
                this.$refs['apiaccessEditForm'].setModal(true);
            },
            sortChange({key, order}){
                this.query = {...this.query, sortField: key, sortOrder: order};
                this.changePage();
            },
            changePage(page){
                page ? this.query.offset = page : null;
                VueUtil(this).select('APIAccess').action('list');
            },
            changeLimit(limit){
                this.query.limit = limit;
                 VueUtil(this).select('APIAccess').action('list');
            },
            listenAPIAccess(data){
                VueUtil(this).cb(data).success(() => {
                    this.$refs['apiaccessEditForm'].setModal(false);
                    setTimeout(() => this.changePage(1), 600);
                }).error();
            },
        }
    }
</script>