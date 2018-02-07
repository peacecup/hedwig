<template>
    <div>
        <Row>
            <Col span="24">
                <div style="float:right">
                    <Page :total="Teams.team_services.data.total" :current="Teams.team_services.data.offset"
                          :page-size-opts="pageSizeOpts" :page-size="query.limit" @on-change="onPageChange"
                          @on-page-size-change="onPageSizeChange" show-sizer show-total size="small"></Page>
                </div>
            </Col>
            <Col span="24">
                <Table  border :columns="columns" :data="Teams.team_services.data.list" show-header size="small"
                    :loading="tableLoading"></Table>
            </Col>
            <Col span="24">
                <div style="float:right">
                    <Page :total="Teams.team_services.data.total" :current="Teams.team_services.data.offset"
                          :page-size-opts="pageSizeOpts" :page-size="query.limit" @on-change="onPageChange"
                          @on-page-size-change="onPageSizeChange" show-sizer show-total size="small"></Page>
                </div>
            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'TeamServices',
        components: {},
        computed: {
            ...VueUtil(this).select(['Teams']).state(),
        },
        props: ['team'],
        data(){
            let fields = [
                {
                    label:'Name',
                    id:'name',
                    render: (h,params) => {
                        return h('router-link',{
                            props:{
                                to:`/services/${params.row.id}/detail`
                            }
                        },params.row.name)
                    }
                }
            ];
            let formUtil =  FormUtil(this).initFields(fields);

            const query =formUtil.defaultQuery();
            query.id = this.$route.params.id;
            return {
                columns:formUtil.columns(),
                pageSizeOpts:[5,10,15,25,50,75,100],
                query:query,
                tableLoading:true
            }
        },
        mounted(){
        },
        watch: {
            'Teams.team_services':'listenTeamServices',
            team(value){
                VueUtil(this).select('Teams').action("team_services",this.query);
            }
        },
        methods: {
            ...VueUtil(this).select(['Teams']).actions(),
            onPageChange(page){
                page ? this.query.offset = page : null;
                this.tableLoading = true;
                VueUtil(this).select('Teams').action("team_services",this.query);
            },
            onPageSizeChange(pageSize){
                this.query.limit = pageSize;
                this.tableLoading = true;
                VueUtil(this).select('Teams').action("team_services",this.query);
            },
            listenTeamServices(){
                this.tableLoading = false;
            }
        }
    }
</script>
