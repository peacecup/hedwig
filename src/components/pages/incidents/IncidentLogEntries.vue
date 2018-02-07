<template>
    <div class="top-bottom-10">
        <!--<h2 class="top-bottom-10">Activity for the Past {{passday}} Days</h2>-->
        <Row>
            <Col span="24">
                <Table :columns="columns" :data="LogEntries.incident_list.data.list" :loading="LogEntries.incident_list.loading" size="small"></Table>
            </Col>
            <Col span="24">
            <div class="text-align-right">
                <Page v-if="LogEntries.incident_list.data.total !== 0" :page-size="query.limit" :total="LogEntries.incident_list.data.total" :loading="LogEntries.incident_list.loading"
                      :current="LogEntries.incident_list.data.offset"
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
        name: 'IncidentLogEntries',
        components: {LogEntryDescription},
        computed: {
            ...VueUtil(this).select(['LogEntries']).state(),
        },
        props: {
            incident: {
                type : Object,
            },
        },

        data(){
            let fields = [
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
                    render: (h, param) => {
                        return h(LogEntryDescription, {
                            props: {
                                logEntry: param.row,
                            }
                        })
                    }
                },
            ]
            let formUtil = FormUtil(this).initFields(fields);
            const query = {
                ...formUtil.defaultQuery(),
                since: ScheduleUtil.momentToString(moment().add(-this.passday, 'd')),
                until: ScheduleUtil.momentToString(moment()),
                include:['services','incidents','channels'],
                id: this.$route.params.id,
                targetType: 'incident',
            };
            return {
                query,
                columns: formUtil.columns(),
            }
        },
        mounted(){
            this.changePage(1);
        },
        watch: {
//            'LogEntries.list': 'listenLogEntries'
        },
        methods: {
            ...VueUtil(this).select(['LogEntries']).actions(),
            changePage(page) {
                page ? this.query.offset = page : null;
                VueUtil(this).select('LogEntries').action('incident_list',{...this.query});
            },
            changelimit(limit) {
                this.query.limit = limit;
                VueUtil(this).select('LogEntries').action('incident_list',this.query);
            },
            listenLogEntries(data) {
            }
        }
    }
</script>