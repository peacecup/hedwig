<template>
    <div>
        <Row style="margin-bottom: 20px;">
            <Col span="24">
            <div style="float:right">
                <Page :total="Teams.team_users.data.total" :current="Teams.team_users.data.offset"
                      :page-size-opts="pageSizeOpts" :page-size="query.limit" @on-change="onPageChange"
                      @on-page-size-change="onPageSizeChange"
                      size="small" show-sizer show-total></Page>
            </div>
            </Col>
            <Col span="24">
            <Table border :columns="columns" :data="Teams.team_users.data.list" show-header size="small"
                   :loading="tableLoading"></Table>
            </Col>
            <Col span="24">
            <div style="float:right">
                <Page :total="Teams.team_users.data.total" :current="Teams.team_users.data.offset"
                      :page-size-opts="pageSizeOpts" :page-size="query.limit" @on-change="onPageChange"
                      @on-page-size-change="onPageSizeChange"
                      size="small" show-sizer show-total></Page>
            </div>
            </Col>
        </Row>
        <Row>
            <Col span="10">
            <h4>External Visibility</h4>
            <p>Configure who can see the team and its objects outside of the team members</p>
            </Col>
            <Col span="14">
            <Dropdown style="margin-left: 20px" trigger="click" @on-click="changeVisible">
                <Button long size="large">
                    <div class="role_visible">
                        <section style="text-align: left;margin: 10px 20px 10px 10px;">
                            <template v-if="externalVisibility == 'private'">
                                <strong>Private</strong>
                                <p>Visible to only team member,Account User,and Global Admins</p>
                            </template>
                            <template v-else>
                                <strong>Public</strong>
                                <p>Visible to all users</p>
                            </template>
                        </section>
                        <Icon type="arrow-down-b"></Icon>
                    </div>
                </Button>
                <DropdownMenu slot="list">
                    <DropdownItem name="PUBLIC">
                        <div style="font-size: 14px" class="role_visible">
                            <section style="text-align: left;margin: 10px 20px 10px 10px;">
                                <strong>Public</strong>
                                <p>Visible to all users</p>
                            </section>
                        </div>
                    </DropdownItem>
                    <DropdownItem name="PRIVATE">
                        <div style="font-size: 14px" class="role_visible">
                            <section style="text-align: left;margin: 10px 20px 10px 10px;">
                                <strong>Private</strong>
                                <p>Visible to only team members，Account Owner，and Global Admins</p>
                            </section>
                        </div>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
            </Col>
        </Row>
    </div>

</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';
    import DropMenuDecorator from '@common/DropMenuDecorator.vue';

    export default{
        name: 'TeamUsers',

        data(){
            let teamRoleMap = new Map([
                ['9', 'Manager'],
                ['10', 'Responder'],
                ['11', 'Observer']
            ]);
            let roleIconMap = new Map([
                ['9', 'settings'],
                ['10', 'person'],
                ['11', 'ios-glasses']
            ])
            let rowMenuList = [
                {title: "Manager", icon: "settings", type: '9'},
                {title: "Responder", icon: "person", type: '10'},
                {title: "Observer", icon: "ios-glasses", type: '11'},
            ]
            let fields = [{
                label: 'name',
                id: 'name',
                width: 250,
                render: (h, params) => {
                    return h('router-link', {
                        props: {
                            to: `/users/${params.row.userId}`
                        }
                    }, params.row.userName)
                }
                },
                {
                    label: 'email',
                    id: 'email',
                },
                {
                    label: 'team role',
                    width: 180,
                    render: (h, params) => {
                        //skateholder--observer  gloable admin/account owner-- manager  ,这三种用户角色的团队角色固定，不能被修改
                        if (_.includes(['7', '1', '2'], params.row.user_role_id)) {
                            return h('Button', {
                                props: {
                                    size: "small",
                                    icon: this.roleIconMap.get(params.row.team_role_id),
                                    long: true
                                }
                            }, this.teamRoleMap.get(params.row.team_role_id))
                        } else {
                            return h('DropMenuDecorator', {
                                props: {
                                    id: params.row.userId,
                                    select: this.changeState,
                                    title: this.teamRoleMap.get(params.row.team_role_id),
                                    list: rowMenuList,
                                    size: "small",
                                    width: "145px",
                                    placement: 'bottom'
                                }
                            })
                        }
                    }
                }]
            let formUtil = FormUtil(this).initFields(fields);
            const query = formUtil.defaultQuery();
            query.id = this.$route.params.id;
            return {
                externalVisibility: "",
                columns: formUtil.columns(),
                pageSizeOpts: [5, 10, 15, 25, 50, 75, 100],
                query: query,
                teamRoleMap: teamRoleMap,
                roleIconMap: roleIconMap,
                tableLoading: true


            }
        },
        components: {DropMenuDecorator},
        computed: {
            ...VueUtil(this).select(['Teams']).state(),
        },
        methods: {
            ...VueUtil(this).select(['Teams']).actions(),
            changeState(id){
                let roleId = id.split("/")[0];
                let userId = id.split("/")[1];
                let payload = {
                    id: this.$route.params.id,
                    userId: userId,
                    roleId: roleId
                }
                VueUtil(this).select('Teams').action("change_role", payload);
            },
            onPageChange(page){
                page ? this.query.offset = page : null;
                this.tableLoading = true;
                VueUtil(this).select('Teams').action("team_users", this.query);
            },
            onPageSizeChange(pageSize){
                this.query.limit = pageSize;
                this.tableLoading = true;
                VueUtil(this).select('Teams').action("team_users", this.query);
            },
            changeVisible(visible){
                this.externalVisibility = visible;
                let payload = {
                    id: this.team.id,
                    external_visibility: visible
                };
                VueUtil(this).select('Teams').action("external_visibility", payload);

            },
            listenTeamUSers(){
                this.tableLoading = false;
            },
            listenVisibleChange(data){
                VueUtil(this).cb(data).success(() => {
                    this.$Message.success("Team role updated successfully.");
                }).error();
                if (!data.loading) {
                    if (data.error) {
                        this.externalVisibility = this.externalVisibility == "public" ? "private" : "public";
                    }
                }
            },
            listenRoleChange(data){
                VueUtil(this).cb(data).success(() => {
                    this.$Message.success("Team role updated successfully.");
                    VueUtil(this).select('Teams').action("team_users", this.query);
                }).error();
            }
        },
        props: ['team'],
        watch: {
            //通过检测props渲染来刷新界面
            team(value){
                this.externalVisibility = value.external_visibility;
                this.tableLoading = true;
                VueUtil(this).select('Teams').action("team_users", this.query);
            },
            "Teams.external_visibility": "listenVisibleChange",
            "Teams.change_role": "listenRoleChange",
            "Teams.team_users": "listenTeamUSers"
        },
        mounted(){
        }

    }
</script>
