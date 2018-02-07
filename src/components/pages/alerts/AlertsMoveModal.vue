<template>
    <Modal width="600px" v-model="modal" @on-ok="saveMoveIncident"
           @on-cancel="closeModal">
        <div>
            <a style="margin-left: 60%;" @click="changeType">{{changeTitle}}</a>
        </div>
        <Row>
            <Col>
            <h3 style="padding-bottom: 10px;">{{$t('h.movetoanotherincident')}}</h3>
            </Col>
        </Row>
        <div style="padding-bottom: 40px;margin-left: -16px;width:600px;height:1px;border-top:1px solid #e9eaec;"></div>
        <IncidentsEditForm ref="form" v-if="changeTypeFlag" v-model="modal" :service="service" :success="success"></IncidentsEditForm>
        <Row v-else>
            <Col span="6" style="padding-top: 7px;">
            <span>{{$t('h.findanexistingincident')}}:</span>
            </Col>
            <Col span="8">
            <Input v-model="searchIncidentNum"></Input>
            </Col>
            <Col span="3" offset="1">
            <Button @click="searchIncident">{{$t('h.findincident')}}</Button>
            </Col>
        </Row>
        <Row v-if="searchStatus==1">
            <Row style="padding-bottom: 10px;padding-top: 10px;">
                <Col>
                <a style="font-size: 16px;">{{incident.title}}</a></Col>
            </Row>
            <div style="padding-bottom: 10px;width:565px;height:1px;border-top:1px solid #e9eaec;"></div>
            <Row>
                <Col span="4" style="text-align:right">
                {{$t('h.status')}}
                </Col>
                <Col span="12" offset="1">
                <span v-if="incident.status=='triggered'" style="color: rgb(166, 0, 0);">{{$t('h.triggered')}}</span>
                <span v-if="incident.status=='acknowledged'" style="color: rgb(166, 0, 0);">{{$t('h.acknowledged')}}</span>
                <span v-if="incident.status=='resolved'" style="color: #00a600;">{{$t('h.resolved')}}</span>
                </Col>
            </Row>
            <Row>
                <Col span="4" style="text-align:right">
                {{$t('h.service')}}
                </Col>
                <Col span="12" offset="1">
                <a>{{incident.service_summary}}</a>
                </Col>
            </Row>
            <Row>
                <Col span="4" style="text-align:right">
                {{$t('h.createdon')}}
                </Col>
                <Col span="12" offset="1">
                <span>{{incident.created_at}}</span>
                </Col>
            </Row>
        </Row>
        <Row v-if="searchStatus==2" style="padding-top:20px;">
            <Alert type="error" show-icon>Access Denied. <a>Find an incident # on the dashboard →</a></Alert>
        </Row>
        <Row v-if="searchStatus==3" style="padding-top:20px;">
            <Alert type="error" show-icon><span style="color:red">Cannot associate triggered alerts with a resolved incident</span>
            </Alert>
        </Row>
        <div slot="footer">
            <Button type="primary" size="large" :loading="loading" @click="saveMoveIncident">{{$t('h.movealert')}}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import _ from "lodash";
    import {VueUtil, FormUtil, Dicts} from "@util";
    import store from "store";
    import DropMenuDecorator from "@common/DropMenuDecorator.vue";
    import IncidentsEditForm from '../incidents/IncidentsEditForm.vue';

    export default {
        components: {IncidentsEditForm},
        computed: {
            ...VueUtil(this)
                .select([
                    "Incidents",
                    "Alerts",
                ])
                .state()
        },
        props: {
            modal: {type: Boolean, default: true},
            incidentData: {type: Object, default: true},
            service: {
                type: Object,
                default: null
            },
            success: Function,
        },
        mounted() {},
        watch: {
            "Incidents.getByIncidentsNumber": "listenSearchIncidents",
            "Incidents.save": "listenIncidents",
            "Alerts.update": "listenAlerts",
        },
        methods: {
            ...VueUtil(this)
                .select([
                    "Incidents",
                    "Alerts"
                ])
                .actions(),
            saveMoveIncident() {
                this.loading = true;
                if (this.changeTypeFlag) {
                    //新增的事件
                    this.$refs['form'].saveIncidents();
                } else {
                    //选择存在的事件
                    if (1 === this.searchStatus && "resolved" != this.incident.status) {
                        //发送update请求
                        let body = [];
                        body.push({
                            id: this.incidentData.id,
                            incident: {
                                id: this.Incidents.getByIncidentsNumber.data.list[0].id
                            }
                        });
                        VueUtil(this)
                            .select("Alerts")
                            .update(body);
                    } else {
                        this.searchStatus = 3;
                        this.loading = false;
                    }
                }
            },
            listenIncidents(data) {
                VueUtil(this)
                    .cb(data)
                    .success(() => {
                        //发送update请求
                        let body = [];
                        body.push({
                            id: this.incidentData.id,
                            incident: {
                                id: data.data.id
                            }
                        });
                        VueUtil(this)
                            .select("Alerts")
                            .update(body);
                    });
            },
            listenAlerts(data) {
                VueUtil(this)
                    .cb(data)
                    .success(() => {
                        //关闭modal    
                        this.closeModal();               
                        let incidentId = data.data.list[0].incident.id;
                        this.$router.push(
                            `/incidents/${incidentId}/Details`
                        );
                    });
            },
            changeType() {
                this.clearFormData(this.changeTypeFlag);
                this.changeTypeFlag = !this.changeTypeFlag;
                this.changeTitle = this.changeTypeFlag
                    ? this.$t("h.messageMEI")
                    : this.$t("h.messageNI");
            },
            clearFormData(flag) {
                if (flag) {
                    this.$refs['form'].$refs.form.resetForm();
                } else {
                    this.searchIncidentNum = "";
                    this.searchStatus = 0;
                }
            },
            searchIncident() {
                let incidentNum = this.searchIncidentNum;
                if (!(null === incidentNum || "" === incidentNum)) {
                    let query = {
                        incident_number: incidentNum
                    };
                    VueUtil(this)
                        .select("Incidents")
                        .action("getByIncidentsNumber", query);
                } else {
                    this.searchStatus = 0;
                }
            },
            listenSearchIncidents(data) {
                VueUtil(this)
                    .cb(data)
                    .success(() => {
                        if (false === this.changeTypeFlag) {
                            if (0 != data.data.list.length) {
                                this.searchStatus = 1;
                                this.incident.title = this.Incidents.getByIncidentsNumber.data.list[0].title;
                                this.incident.status = this.Incidents.getByIncidentsNumber.data.list[0].status;
                                this.incident.service_summary = this.Incidents.getByIncidentsNumber.data.list[0].service;
                                this.incident.created_at = this.Incidents.getByIncidentsNumber.data.list[0].created_at;
                            } else {
                                this.searchStatus = 2;
                            }
                        }
                    });
            },
            closeModal() {
                this.clearFormData(this.changeTypeFlag);
                this.$emit("closeModal");
                setTimeout(() => {
                    this.changeTypeFlag = true;
                }, 300);
            }
        },
        data() {
            return {
                searchStatus: 0,
                changeTitle: this.$t("h.messageMEI"),
                changeTypeFlag: true,
                searchIncidentNum: null,
                incident: {
                    title: null,
                    status: "triggered",
                    service_summary: null,
                    created_at: null
                },
                loading: false
            };
        }
    };
</script>
