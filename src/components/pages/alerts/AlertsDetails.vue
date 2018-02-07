<template>
    <Row>
        <Row>
            <Col span="20">
                <Row style="width: 100%;border-bottom: 1px solid #e9eaec">
                    <Col span="24">
                    <h1>{{alert.summary}}</h1>
                    </Col>
                </Row>
            <Row style="height:45px;width: 100%;border-bottom: 1px solid #e9eaec">
                <Col>
                <span style="font-size: 16px;padding-top: 15px;font-weight: 400;">
              {{$t('h.relatedtoincident')}}
            </span>
                <span style="font-size: 16px;padding-top: 15px;font-weight: 400;">
              <router-link :to="`/incidents/${incident.id}/Details`">{{incident.summary}}</router-link>
            </span>
                <span style="font-size: 16px;padding-top: 15px;">(</span>
                <span v-if="incident.status=='triggered'" style="font-size: 16px;padding-top: 15px;font-weight: 400;color: rgb(166, 0, 0);">
                    {{$t('h.triggered')}}
                </span>
                <span v-if="incident.status=='acknowledged'" style="font-size: 16px;padding-top: 15px;font-weight: 400;color: rgb(166, 0, 0);">
                    {{$t('h.acknowledged')}}
                </span>
                <span v-if="incident.status=='resolved'" style="font-size: 16px;padding-top: 15px;font-weight: 400;color: #00a600;">
                    {{$t('h.resolved')}}
                </span>
                <span style="font-size: 16px;padding-top: 15px;">)</span>
                </Col>
            </Row>
            <Row style="width: 100%;">
                <table style="margin-left: 50px;margin-top: 30px;">
                    <tr>
                        <td style="font-weight: 700;text-align: right;">{{$t('h.severity')}}</td>
                        <td style="padding-left: 15px;">{{alert.severity}}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: 700;text-align: right;">{{$t('h.alerttimes')}}</td>
                        <td style="padding-left: 15px;">
                            {{ moment(alert.created_at).format($t('date.dateTimeFull')) }}

                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: 700;text-align: right;">{{$t('h.alertkey')}}</td>
                        <td style="padding-left: 15px;">{{alert.alert_key}}</td>
                    </tr>
                    <tr style="height: 50px">
                        <td style="font-weight: 700;text-align: right;">{{$t('h.currentstatus')}}</td>
                        <td style="padding-left: 15px;">
                            <span v-if="alert.status=='triggered'" style="color: #ED3F14;">{{$t('h.triggered')}}</span>
                            <span v-else style="color: #00a600;">{{$t('h.resolved')}}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: 700;text-align: right;">{{$t('h.service')}}</td>
                        <td style="padding-left: 15px;">
                            <permission-router-link :target="service" type="service">{{service.summary}}
                            </permission-router-link>
                        </td>
                    </tr>
                    <!-- <tr>
                      <td style="font-weight: 700;text-align: right;">Service Description</td>
                      <td style="padding-left: 15px;"></td>
                    </tr> -->
                    <tr>
                        <td style="font-weight: 700;text-align: right;">{{$t('h.integration')}}</td>
                        <td style="padding-left: 15px;">
                            <permission-router-link :target="{serviceId: service.id,id:integration.id}" type="integration">
                                {{integration.summary}}
                            </permission-router-link>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: 700;text-align: right;padding-top: 15px;">{{$t('h.source')}}</td>
                        <td style="padding-left: 15px;padding-top: 15px;">{{source}}</td>
                    </tr>
                    <!-- <tr>
                      <td style="font-weight: 700;text-align: right;">Group</td>
                      <td style="padding-left: 15px;"></td>
                    </tr> -->
                </table>
            </Row>
            <Row>
                <Col>
                <h1 style="padding-top:15px;">{{$t('h.details')}}</h1>
                </Col>
                <Col style="width: 100%;background-color: #eee;">
                <span style="font-weight: 700;color: #555;font-size: 13px;padding-left: 10px;">
              {{$t('h.summary')}}
            </span>
                </Col>
                <Col>
                <span style="padding-left: 10px;">
              {{alert.summary}}
            </span>
                </Col>
                <Col style="width: 100%;background-color: #eee;">
                <span style="font-weight: 700;font-size: 13px;color: #005c9c;padding-left: 10px;">
              {{$t('h.viewmessage')}}
            </span>
                </Col>
            </Row>
                <Row>
                    <Col>
                        <h1 style="padding-top:15px;">Alert Log</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table :loading="loading" :no-data-text="noDataText" size="small" :columns="columns" :data="LogEntries.list.data.list"></Table>
                    </Col>
                </Row>
                <Row>
                    <Col offset="18">
                        <Page :page-size="query.limit" :total="LogEntries.list.data.total" :current="LogEntries.list.data.offset" size="small" @on-change="changePage" @on-page-size-change="changePageSizer" show-total show-sizer></Page>
                    </Col>
                </Row>
            </Col>
            <Col span="4">
            <Row v-if="alert.status=='triggered'" style="padding-bottom: 23px;">
                <Button style="width: 100%;" @click="changeAlertStatus">
                    {{$t('h.resolve')}}
                </Button>
            </Row>
            <Row>
                <Button style="width: 100%;" @click="openModal">
                    {{$t('h.movetoanotherincident')}}

                </Button>
                <AlertsMoveModal
                        :modal="modal"
                        :incidentData="incidentData"
                        @closeModal="closeModal">
                </AlertsMoveModal>
            </Row>
            </Col>
        </Row>
    </Row>
</template>
<script>
    import moment from "moment";
    import _ from "lodash";
    import store from "store";
    import {VueUtil, FormUtil} from "@util";
    import AlertsMoveModal from "./AlertsMoveModal.vue";
    import LogEntryDescription from '../incidents/LogEntryDescription';

    export default {
        components: {
            AlertsMoveModal,
            LogEntryDescription
        },
        computed: {
            ...VueUtil(this)
                .select(["Services", "Users", "Incidents", "Alerts","LogEntries"])
                .state()
        },
        mounted() {
            this.getAlertLogs();
            VueUtil(this)
                .select("Alerts")
                .get(this.$route.params);
        },
        watch: {
            "Alerts.get": "lisetenAlerts",
            "Alerts.update": "lisetenUpdateAlerts",
            "LogEntries.list": "lisetenAlertsLog",
        },
        methods: {
            ...VueUtil(this)
                .select(["Services", "Users", "Incidents", "Alerts", "LogEntries"])
                .actions(),
            openModal() {
                this.modal = true;
                //alert数据传入modal
                this.incidentData = this.Alerts.get.data;
            },
            closeModal() {
                this.modal = false;
            },
            lisetenAlerts(data) {
                VueUtil(this)
                    .cb(data)
                    .success(() => {
                        this.alert = data.data;
                        this.service = data.data.service;
                        this.type = data.data.type;
                        this.source = data.data.source;
                        this.integration = data.data.integration;
                        this.incident = data.data.incident;
                    });
            },
            changeAlertStatus() {
                let updateQuery = [];
                updateQuery.push({
                    id: this.Alerts.get.data.id,
                    type: this.Alerts.get.data.type,
                    status: "resolved"
                });
                VueUtil(this)
                    .select("Alerts")
                    .update(updateQuery);
            },
            lisetenUpdateAlerts(data) {
                VueUtil(this)
                    .cb(data)
                    .success(() => {
                        VueUtil(this)
                            .select("Alerts")
                            .get(this.$route.params);
                        this.$Message.success(`${data.type} success!`);
                        //当reslove当前告警刷新log
                        this.getAlertLogs();
                    });
            },
            lisetenAlertsLog(data){
                VueUtil(this)
                    .cb(data)
                    .success(() => {
                        this.loading = false;
                    });
            },
            getAlertLogs() {
                let {incidentId,alertId} = this.$route.params;
                this.query = {
                    ...this.query,
                    alertId : alertId,
                    targetType: 'alert',
                    include:['channels']
                }
                VueUtil(this)
                .select("LogEntries")
                .list(this.query);
            },
            changePage(Page) {
                if (_.isNumber(page)) {
                    this.query.offset = page;
                }
                this.loading = true;
                this.getAlertLogs();
            },
            changePageSizer(pageSize) {
                this.query.limit = pageSize;
                this.loading = true;
                this.getAlertLogs();
            }
        },
        data() {
            const fields = [
                {
                  label: "Time",
                  id: "created_at",
                  type: "select",
                  forever: true,
                  clearable: true,
                  span: 22,
                  width:200,
                  formIndex: 0,
                  render: (h, param) => {
                    return moment(param.row.created_at).format(
                        this.$t("date.dateTimeFull")
                    );
                  }
                },
                {
                  label: "Activity",
                  id: "summary",
                  type: "select",
                  forever: true,
                  clearable: true,
                  span: 22,
                  formIndex: 1,
                  render: (h,param) => {
                        return h(LogEntryDescription,{
                            props:{
                                logEntry: param.row,
                            }
                        });
                    }              
                }
            ];
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            const columns = [...formUtil.columns()];
            return {
                alert: {
                    summary: null,
                    status: null,
                    severity: null,
                    alert_key: null,
                    created_at: null
                },
                service: {
                    id: null,
                    summary: null
                },
                integration: {
                    id: null,
                    summary: null
                },
                incident: {
                    id: null,
                    summary: null,
                    status:null
                },
                type: "alert",
                source: null,
                modal: false,
                total: null,
                current: null,
                pageSize: 0,
                incidentData: {},
                columns: columns,
                noDataText: "No alerts logs.",
                loading: false,
                query: {},
            };
        }
    };
</script>
