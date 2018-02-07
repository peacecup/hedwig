<template>
    <div class="top-bottom-10">
        <h2 class="top-bottom-10">Activity for the Past {{passday}} Days</h2>
        <Row>
            <Col span="24">
            <Table :columns="columns" :data="LogEntries.list.data.list" size="small"></Table>
            </Col>
            <Col span="24">
            <div class="text-align-right">
                <Page v-if="LogEntries.list.data.total !== 0" :page-size="query.limit" :total="LogEntries.list.data.total" :loading="LogEntries.list.loading"
                      :current="LogEntries.list.data.offset"
                      size="small" @on-change="changePage" @on-page-size-change="changelimit" show-total
                      show-sizer></Page>
            </div>
            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import LogEntryDescription from './LogEntryDescription';
    import {VueUtil, FormUtil, ScheduleUtil} from '@util';

    export default{
        name: 'LogEntries',
        components: {LogEntryDescription},
        computed: {
            ...VueUtil(this).select(['LogEntries']).state(),
        },
        props: {
            user: {
                type : [Object,String],
            },
            passday : {
                type: Number,
                default: 7,
            }
        },
        destroyed(){
            VueUtil(this).select('LogEntries').clear('list');
        },
        data(){
            let fields = [
                {
                    id: 'service',
                    label: 'service',
                    width:'150px',
                    render: (h,param) => {
                        if(param.row.service){
                            return h('permission-router-link',{
                                props: {
                                    target:param.row.service,
                                    type:'service',
                                }
                            },param.row.service.summary);
                        }else{
                            return '';
                        }

                    }
                },
                {
                    id: 'summary',
                    label: 'title',
                    width:'250px',
                    render: (h,param) => {
                        if(param.row.incident){
                            return h('router-link',{
                                props: {
                                    to: `/incidents/${param.row.incident.id}`,
                                }
                            },`#[${param.row.incident.id}]${param.row.incident.summary || param.row.incident.id}`);
                        }else {
                            return '';
                        }

                    }
                },
                {
                    id: 'created_at',
                    label: 'time',
                    width:'180px',
                    render: (h,param) => {
                        return moment(param.row.created_at).format(this.$t('date.MDTime'))
                    }
                },
                {
                    id: 'summary',
                    label: 'Activity',
                    render: (h,param) => {
                        return h(LogEntryDescription,{
                            props:{
                                logEntry: param.row,
                            }
                        });
                    }
                },
            ]
            let formUtil = FormUtil(this).initFields(fields);
            const query = {
                ...formUtil.defaultQuery(),
                since: ScheduleUtil.momentToString(moment().add(-this.passday, 'd')),
                until: ScheduleUtil.momentToString(moment()),
                include:['services','incidents','channels'],
                targetType: 'incident',
            };
            return {
                query,
                columns: formUtil.columns(),
            }
        },
        mounted(){
            if(this.user){
                if(_.isObject(this.user)) {
                    this.query.userId = this.user.id;
                }
                this.changePage(1);
            }
        },
        watch: {
        },
        methods: {
            ...VueUtil(this).select(['LogEntries']).actions(),
            changePage(page) {
                page ? this.query.offset = page : null;
                VueUtil(this).select('LogEntries').list({...this.query});
            },
            changelimit(limit) {
                this.query.limit = limit;
                VueUtil(this).select('LogEntries').list(this.query);
            },
        }
    }
</script>