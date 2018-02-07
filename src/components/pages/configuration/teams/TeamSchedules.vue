<template>
    <div>
        <Row>
            <Col span="24">
                <div style="float:right">
                    <Page :total="Teams.team_schedules.data.total" :current="Teams.team_schedules.data.offset"
                          :page-size-opts="pageSizeOpts" :page-size="query.limit" @on-change="onPageChange"
                          @on-page-size-change="onPageSizeChange" show-sizer show-total size="small"></Page>
                </div>
            </Col>
            <Col span="24">
                <Table  border :columns="columns" :data="Teams.team_schedules.data.list" show-header size="small"
                    :loading="tableLoading"></Table>
            </Col>
            <Col span="24">
                <div style="float:right">
                    <Page :total="Teams.team_schedules.data.total" :current="Teams.team_schedules.data.offset"
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
        name: 'TeamSchedules',
        components: {},
        computed: {
            ...VueUtil(this).select(['Teams','Schedules']).state(),
            scheduleMap(){
                let scheduleArray =  _.map( this.Schedules.all.data.list,function(value){
                    return [value.id,value.name];
                });
                return new Map(scheduleArray);
            }
        },
        props: ['team'],
        data(){
            let fields = [
                {
                    label:'Name',
                    id:'name',
                    render: (h,params) => {
                        return h('router-link',{
                            props: {
                                to: `/schedules/${params.row.id}/view`
                            }
                        },this.scheduleMap.get(params.row.id))
                    }
                }
            ];
            let formUtil = FormUtil(this).initFields(fields);
            const query = FormUtil(this).defaultQuery();
            query.id = this.$route.params.id;
            return {
                columns:formUtil.columns(),
                pageSizeOpts:[5,10,15,25,50,75,100],
                query:query,
                tableLoading:true
            }
        },
        mounted(){
            VueUtil(this).select('Schedules').all();
        },
        watch: {
            'Teams.team_schedules':'listenTeamSchedules',
            team(value){
                VueUtil(this).select('Teams').action("team_schedules",this.query);
            }
        },
        methods: {
            ...VueUtil(this).select(['Teams','Schedules']).actions(),
            onPageChange(page){
                page ? this.query.offset = page : null;
                this.tableLoading = true;
                VueUtil(this).select('Teams').action("team_schedules",this.query);
            },
            onPageSizeChange(pageSize){
                this.query.limit = pageSize;
                this.tableLoading = true;
                VueUtil(this).select('Teams').action("team_schedules",this.query);
            },
            listenTeamSchedules(){
                this.tableLoading = false;
            }
        }
    }
</script>
