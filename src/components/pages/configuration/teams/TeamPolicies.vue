<template>
    <div>
        <Row>
            <Col span="24">
                <div style="float:right">
                    <Page :total="Teams.team_escalationpolicies.data.total" :current="Teams.team_escalationpolicies.data.offset"
                          :page-size-opts="pageSizeOpts" :page-size="query.limit" @on-change="onPageChange"
                          @on-page-size-change="onPageSizeChange" show-sizer show-total size="small"></Page>
                </div>
            </Col>
            <Col span="24">
                <Table  border :columns="columns" :data="Teams.team_escalationpolicies.data.list"  size="small"
                    :loading="tableLoading"></Table>
            </Col>
            <Col span="24">
                <div style="float:right">
                    <Page :total="Teams.team_escalationpolicies.data.total" :current="Teams.team_escalationpolicies.data.offset"
                          :page-size-opts="pageSizeOpts" :page-size="query.limit" @on-change="onPageChange"
                          @on-page-size-change="onPageSizeChange" show-sizer show-total size="small"></Page>
                </div>
            </Col>
        </Row>
    </div>

</template>

<script>
    import {VueUtil, FormUtil} from '@util';
    import DropMenuDecorator from '@common/DropMenuDecorator.vue';

    export default{
        name: 'TeamPolicies',
        data(){
            let rowMenuList =[
                {title:"Remove",icon:"android-close",type:'view'},
            ]
            let fields = [
                {
                    label:'name',
                    id:'name',
                    render: (h,params) => {
                        return h('router-link',{
                            props:{
                                to:`/policies/${params.row.id}/detail`
                            }
                        },params.row.name)
                    }
                },
                {
                    align: 'center',
                    width: 150,
                    render: (h, params) => {
                        return h('DropMenuDecorator', {
                            props: {
                                id: params.row.id,
                                select: this.removeEscalationPolicy,
                                title: 'Operate',
                                list: rowMenuList,
                                size:"small"
                            }
                        })
                    }
                }
            ];
            let formUtil = FormUtil(this).initFields(fields);
            const query = formUtil.defaultQuery();
            query.id = this.$route.params.id;
            return {
                data:[],
                columns:formUtil.columns(),
                pageSizeOpts:[5,10,15,25,50,75,100],
                query:query,
                tableLoading:true
            }
        },
        components: {DropMenuDecorator},
        computed: {
            ...VueUtil(this).select(['Teams']).state(),
        },
        methods: {
            ...VueUtil(this).select(['Teams']).actions(),
            removeEscalationPolicy(id){
                let escalation_policy_id = id.split("/")[1];
                let data = {
                    id:this.$route.params.id,
                    escalation_policy_id:escalation_policy_id
                }
                VueUtil(this).select('Teams').action("remove_escalation_policy",data);
            },
            listenRemoveEscalationPolicy(data){
                VueUtil(this).cb(data).success(() => {
                    VueUtil(this).select('Teams').action("team_escalationpolicies",this.query);
                    this.$emit('escaPolicyChange');
                }).error();
            },
            onPageChange(page){
                page ? this.query.offset = page : null;
                this.tableLoading = true;
                VueUtil(this).select('Teams').action("team_escalationpolicies",this.query);
            },
            onPageSizeChange(pageSize){
                this.query.limit = pageSize;
                this.tableLoading = true;
                VueUtil(this).select('Teams').action("team_escalationpolicies",this.query);
            },
            listenTeamPolicies(){
                this.tableLoading = false;
            }

        },
        props: ['team',"escaPolicyChange"],
        watch: {
            team(value){
                VueUtil(this).select('Teams').action("team_escalationpolicies",this.query);
            },
            "Teams.remove_escalation_policy":"listenRemoveEscalationPolicy",
            "Teams.team_escalationpolicies":"listenTeamPolicies"
        },
        mounted(){
        }

    }
</script>
