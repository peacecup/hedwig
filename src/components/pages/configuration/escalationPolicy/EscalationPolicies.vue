<template>
    <div class="escalation_policy">
        <Row >
            <Col span="20">
                <Row style="width: 100%;border-bottom: 1px solid #e9eaec">
                    <Col span="16">
                        <h1 class="title">{{title}}</h1>
                    </Col>
                    <Col span="8">
                        <div style=" float: right;">
                            <Input v-model="search" icon="ios-search" placeholder="Search.." @on-click="doSearch"
                               @on-enter="doSearch" ></Input>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span="24">
                        <div style="float: right">
                            <Page :total="EscalationPolicies.list.data.total"  :current="EscalationPolicies.list.data.offset"
                                  :page-size-opts="pageSizeOpts" :page-size="query.limit"  size="small"
                                  @on-change="onPageChange" @on-page-size-change="onPageSizeChange" show-sizer show-total></Page>
                        </div>
                    </Col>
                    <Col span="24">
                        <Spin fix size="large" v-if="EscalationPolicies.list.loading"></Spin>
                        <Alert style="text-align: center" v-if="EscalationPolicies.list.data.total === 0">
                            No EscalationPolicy found with current filters.
                        </Alert>
                        <template v-for="escalationPolicy in EscalationPolicies.list.data.list">
                            <view-policy :showRelation="true" :escalationPolicy="escalationPolicy" :delEscalationPolicy="delEscalationPolicy" ></view-policy>
                        </template>
                    </Col>
                    <Col span="24">
                        <div style="float: right">
                            <Page :total="EscalationPolicies.list.data.total"  :current="EscalationPolicies.list.data.offset"
                                  :page-size-opts="pageSizeOpts" :page-size="query.limit"  size="small"
                                  @on-change="onPageChange" @on-page-size-change="onPageSizeChange" show-sizer show-total></Page>
                        </div>
                    </Col>
                </Row>
            </Col>
            <Col span="4">
                <Card bordered >
                    <p slot="title">
                        Add In Here
                    </p>
                    <Button v-key="`escalationPolicy.new`" type="success" icon="ios-plus" @click="newEscalationPlocy">{{I18n('new escalation policy')}}</Button>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script scoped>

    import ViewPolicy from './ViewPolicy.vue';
    import {VueUtil,FormUtil} from  '@util';
    import _ from "lodash";
    export default {
        name: 'EscalationPolicies',
        data(){
            const query = FormUtil(this).defaultQuery();
            query.include = ["teams","services","targets"];
            query.team_ids = [];
            return {
                title:"Escalation Policies on All Teams",
                search:"",
                query:query,
                pageSizeOpts:[5,10,15,25,50,75,100],
            };
        },
        computed:{
            ...VueUtil(this).select(['EscalationPolicies','Teams']).state(),
        },
        methods:{
            ...VueUtil(this).select(['EscalationPolicies','Teams']).actions(),
            I18n(key){
              return VueUtil(this).I18n(key);
            },
            onPageChange(page){
                page ? this.query.offset = page : null;
                VueUtil(this).select('EscalationPolicies').list(this.query);
            },
            doSearch(){
                this.query.query = this.search;
                VueUtil(this).select('EscalationPolicies').list(this.query);
            },
            onPageSizeChange(pageSize){
                this.query.limit = pageSize;
                VueUtil(this).select('EscalationPolicies').list(this.query);
            },
            newEscalationPlocy(){
                this.$router.push("./policies/add")
            },
            delEscalationPolicy(id){
                 VueUtil(this).select('EscalationPolicies').delete(id);
            },
            delListener(data){
                VueUtil(this).cb(data).success(() => {
                    this.$Message.success("delete EscalationPolicy  successfully.");
                    VueUtil(this).select('EscalationPolicies').list(this.query);
                }).error();
            },
            chooseTeamChange(team){
                if (_.get(team, 'data.id', null)) {
                    this.title = `Escalation Policies On ${team.data.name}`;
                    this.query.team_ids.splice(0,1,team.data.id);
                } else {
                    this.title = `Escalation Policies On All Teams`;
                    this.query.team_ids = [];
                }
                VueUtil(this).select('EscalationPolicies').list(this.query);
            }
        },
        components:{
            ViewPolicy
        },
        watch:{
            'EscalationPolicies.delete':'delListener',
            'Teams.choose':"chooseTeamChange"
        },
        mounted(){
            this.chooseTeamChange(this.Teams.choose);
        }
    };

</script>
