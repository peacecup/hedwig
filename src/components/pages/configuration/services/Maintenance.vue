<template>
    <div class="maintenance">
        <Row>
            <Col span="24">
            <div style="float: right;">
                <Page :total="Maintenance.list.data.total" :current="Maintenance.list.data.offset" size="small"
                      @on-change="changePage" @on-page-size-change="changePageSizer" show-total :page-size="query.limit"
                      show-sizer></Page>
            </div>
            </Col>
            <Col span="24">
            <Table @on-sort-change="sortChange" size="small" :columns="columns"
                   :data="Maintenance.list.data.list"></Table>

            </Col>
            <Col span="24">
            <div style="float: right;">
                <Page :total="Maintenance.list.data.total" :current="Maintenance.list.data.offset" size="small"
                      :loading="Maintenance.list.loading"
                      @on-change="changePage" @on-page-size-change="changePageSizer" show-total :page-size="query.limit"
                      show-sizer></Page>
            </div>
            </Col>
        </Row>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'Maintenance',
        components: {},
        computed: {
            ...VueUtil(this).select(['Maintenance', 'Services', 'Teams']).state(),
        },
        props: {},

        data(){
            const dicts = {
                services: []
            }
            const date_format = this.$t('date.MDTime');
            const fields = [
                {
                    id: "id",
                    label: "id",
                    type: "hidden",
                },
                {
                    label: "BLANK",
                    scope: ['column'],
                    render: (h, param) => {
                        return h('permission-router-link', {
                            props: {
                                type : 'maintenance',
                                target: {
                                    id: param.row.id,
                                    serviceId: param.row.services[0].id,
                                },
                                action :'edit'
                            }
                        }, param.row.id);
                    }
                }, {
                    id: "start_time",
                    label: "Start Time",
                    type: "datetime",
                    format: date_format,
                    render: (h, params) => {
                        return moment(params.row.start_time).format(date_format);
                    }
                }, {
                    id: "end_time",
                    label: "End Time",
                    type: "datetime",
                    format: date_format,
                    render: (h, params) => {
                        return moment(params.row.end_time).format(date_format);
                    }
                }, {
                    id: "status",
                    label: "Status",
                }, {
                    id: "services",
                    label: "Services",
                    render: (h, params) => {
                        return h('div', _.map(params.row.services, service => {
                            return h('permission-router-link', {
                                props: {
                                    type: 'service',
                                    target: service
                                },
                                style: {
                                    marginRight: '10px'
                                }
                            }, service.summary || service.id);
                        }))
                    }
                }, {
                    id: "created_by",
                    label: "Created",
                    render: (h, params) => {
                        if (params.row.created_by !== null) {
                            return h('router-link', {
                                props: {
                                    to: `/users/${params.row.created_by.id}`
                                },
                                style: {
                                    marginRight: '10px'
                                }
                            }, params.row.created_by.summary || params.row.created_by.id);
                        } else {
                            return ""
                        }
                    }
                }, {
                    id: "description",
                    label: "description",
                    type: "textarea",
                    span: 24,
                },];
            var formUtil = FormUtil(this).initFields(fields);
            let query = formUtil.defaultQuery();
            query.include = ['services', 'users'];
            return {
                dicts,
                query,
                loading: false,
                columns: formUtil.columns(),
                button: {
                    enabled: false
                }
            }
        },
        mounted(){
            this.listenChooseTeams(this.Teams.choose);
        },
        watch: {
            "Maintenance.save": "listenMaintenance",
            'Teams.choose': 'listenChooseTeams',
        },
        methods: {
            ...VueUtil(this).select(['Maintenance', 'Services']).actions(),
            listenMaintenance(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'save') {
                        this.changePage(1);
                    }
                })
            },
            listenChooseTeams(team){
                if (_.get(team, 'data.id', null)) {
                    this.query.team_ids = [team.data.id];
                } else {
                    this.query.team_ids = null;
                }
                this.changePage(1);
            },
            sortChange({key, order}){
                this.query = {...this.query, sortField: key, sortOrder: order};
                if (!this.query.team_ids && _.get(this.Teams, 'choose.data.id', null) !== null) {
                    this.query.team_ids = [_.get(this.Teams, 'choose.data.id', null)];
                }
                this.changePage();
            },
            changePage(page){
                page ? this.query.offset = page : null;
                VueUtil(this).select('Maintenance').list(this.query);
            },
            changePageSizer(pageSize){
                this.query.limit = pageSize;
                VueUtil(this).select('Maintenance').list(this.query);
            },


        }
    }
</script>