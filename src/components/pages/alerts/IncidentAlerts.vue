<template>
    <Row span="24">
        <Row v-if="altersListFlag">
            <Row>
                <Col span="24">
                <div style="float: right;">
                    <Page :page-size="incidentAlertList.limit" :total="incidentAlertList.total"
                          :current="incidentAlertList.offset"
                          size="small"
                          @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                          show-sizer></Page>
                </div>
                </Col>
            </Row>
            <Row span="24">
                <Col span="2">
                <Button @click="changeStatus" :disabled="resolveStatus">
                    {{$t('h.resolve')}}

                </Button>
                </Col>
                <Col style="float: right;">
                <CheckboxGroup v-model="showColumns">
                    <Dropdown trigger="custom" :visible="visible">
                        <Button @click="handleOpen">{{ $t('h.customizecolumns') }}
                            <Icon type="arrow-down-b"></Icon>
                        </Button>
                        <DropdownMenu slot="list">
                            <DropdownItem :key="column.title" v-for="column in columns" class="text-align-left">
                                <Checkbox v-if="column.id" style="width: 100%;" :label="column"
                                          :disabled="column.forever">
                                    {{column.title}}

                                </Checkbox>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </CheckboxGroup>
                <div class="mask-layer" v-if="visible" @click="handleClose"></div>
                </Col>
            </Row>
            <Row>
                <Col span="24">
                <Table :loading="loading" :no-filtered-data-text="noDataText" :no-data-text="noDataText"
                       @on-sort-change="sortChange" @on-selection-change="selectionChange"
                       size="small" :data="incidentAlertList.list" :columns="finalShowColumns">
                </Table>
                </Col>
            </Row>
            <AlertsMoveModal
                    :modal="modal"
                    :incidentData="incidentData"
                    @closeModal="closeModal">
            </AlertsMoveModal>
        </Row>
        <Row v-else>
            <Col style="width: 100%;background-color: #eee;">
            <span style="font-weight: 700;color: #555;font-size: 13px;padding-left: 10px;">
          {{$t('h.title')}}
        </span>
            </Col>
            <Col>
            <span style="padding-left: 10px;">
          {{incidentObj.title}}
        </span>
            </Col>
            <Col style="width: 100%;background-color: #eee;">
            <span style="font-weight: 700;font-size: 13px;color: #005c9c;padding-left: 10px;">
          {{$t('h.viewmessage')}}
        </span>
            </Col>
        </Row>
    </Row>
</template>

<script>
    import _ from "lodash";
    import {VueUtil, FormUtil, Dicts} from "@util";
    import store from "store";
    import DropMenuDecorator from "@common/DropMenuDecorator.vue";
    import AlertsMoveModal from "./AlertsMoveModal.vue";
    import moment from "moment";

    export default {
        components: {
            AlertsMoveModal
        },
        computed: {
            ...VueUtil(this)
                .select(["Incidents", "Services", "Users", "Alerts"])
                .state()
        },
        methods: {
            ...VueUtil(this)
                .select(["Incidents", "Services", "Users", "Alerts"])
                .actions(),
            openModal(id) {
                this.modal = true;
                //alert数据传入modal
                this.incidentData = this.judgmentStatus(id);
            },
            closeModal() {
                this.modal = false;
            },
            sortChange({key, order}) {
                this.query = {...this.query, sortField: key, sortOrder: order};
                this.changePage();
            },
            selectionChange(rows) {
                let arr = [];
                for (let num in rows) {
                    if ("triggered" === rows[num].status) {
                        this.resolveStatus = false;
                        arr.push(rows[num]);
                    } else {
                        this.resolveStatus = true;
                    }  
                }
                this.selectRows = arr;
            },
            changeStatus() {
                console.log(this.resolveSelect);
                let updateQuery = [];
                this.selectRows.map(row => {
                    if ("triggered" === row.status) {
                    updateQuery.push({
                        id: row.id,
                        type: row.type,
                        status: "resolved"
                    });
                    }
                });
                VueUtil(this)
                    .select("Alerts")
                    .update(updateQuery);
            },
            changePage(page) {
                if (_.isNumber(page)) {
                    this.query.offset = page;
                }
                this.query = _.assign(this.query, {
                    ...this.queryForms
                });
                let incidentId = this.$route.params.id;
                this.query.id = incidentId;
                this.loading = true;
                VueUtil(this)
                    .select("Alerts")
                    .action("get_incident_alert_list", this.query);
            },
            changePageSizer(pageSize) {
                this.query.limit = pageSize;
                this.loading = true;
                VueUtil(this)
                    .select("Alerts")
                    .action("get_incident_alert_list", this.query);
            },
            handleOpen() {
                this.visible = true;
            },
            handleClose() {
                this.visible = false;
            },
            listenIncidentAlertList(data) {
                VueUtil(this)
                    .cb(data)
                    .success(() => {
                        this.loading = false;
                        this.incidentAlertList = this.Alerts.get_incident_alert_list.data;
                        if (
                            0 === this.incidentAlertList.list.length &&
                            false === this.filterFlag
                        ) {
                            this.altersListFlag = false;
                        } else {
                            this.altersListFlag = true;
                        }
                    })
                    .error();
            },
            operate(id) {
                let $id = id.split("/");
                switch ($id[0]) {
                    case "view":
                        let incidentId = this.$router.history.current.params.id;
                        this.$router.push(
                            `/alerts/${$id[1]}/details`
                        );
                        break;
                    case "resolve":
                        this.updateRowStatus($id[1]);
                        break;
                    case "MovetoAnotherIncident":
                        this.openModal($id[1]);
                        break;
                }
            },
            updateRowStatus(id) {
                let obj = this.judgmentStatus(id);
                if ("resolved" === obj.status) {
                    //不发请求
                    this.$Message.success(`this data is resolved!`);
                } else {
                    //发请求
                    let alert = [];
                    alert.push({
                        id: obj.id,
                        type: obj.type,
                        status: "resolved"
                    });
                    let updateQuery = {
                        incident: obj.incident.id
                    };
                    VueUtil(this)
                        .select("Alerts")
                        .update(updateQuery);
                }
            },
            judgmentStatus(id) {
                let alertsList = this.Alerts.get_incident_alert_list.data.list;
                for (let d in alertsList) {
                    if (id === alertsList[d].id) {
                        return alertsList[d];
                    }
                }
            },
            listenAlertsUpdate(data) {
                VueUtil(this)
                    .cb(data)
                    .success(() => {
                        this.resolveStatus = true;
                        this.$Message.success(`update success!`);
                        this.changePage();
                    })
                    .error();
            }
        },
        mounted() {
            this.changePage(1);
        },
        watch: {
            "Alerts.get_incident_alert_list": "listenIncidentAlertList",
            "Alerts.update": "listenAlertsUpdate",
            showColumns(showColumns) {
                let columns = [];
                _.forEach(this.columns, c => {
                    if (_.filter(showColumns, s => s.id === c.id).length === 1) {
                        columns.push(c);
                    }
                });
                this.finalShowColumns = columns;
            }
        },
        props: {
            incidentObj: {type: Object, default: true}
        },
        data() {
            const fields = [
                {
                    type: "selection",
                    forever: true,
                    width: 60,
                    align: "center",
                    scope: ["column"],
                    formIndex: 0
                },
                {
                    label: "Status",
                    id: "status",
                    type: "select",
                    clearable: true,
                    formIndex: 1,
                    span: 22,
                    forever: true,
                    render: (h, param) => {
                        return h(
                            "span",
                            {
                                style: {
                                    color: Dicts.incident_status[param.row.status].color
                                }
                            },
                            param.row.status
                        );
                    },
                    filterRemote: (value, row) => {
                        this.queryForms.statuses = value.length === 1 ? [value[0]] : null;
                        this.filterFlag = true;
                        this.changePage();
                    },
                    filters: [
                        {
                            label: "resolved",
                            value: "resolved"
                        },
                        {
                            label: "triggered",
                            value: "triggered"
                        }
                    ],
                    filterMultiple: false
                },
                {
                    label: "Severity",
                    id: "severity",
                    type: "select",
                    clearable: true,
                    span: 22,
                    formIndex: 2,
                    forever: true,
                    filterRemote: (value, row) => {
                        this.queryForms.severity = value.length === 1 ? [value[0]] : null;
                        this.filterFlag = true;
                        this.changePage();
                    },
                    filters: [
                        {
                            label: "Critical",
                            value: "critical"
                        },
                        {
                            label: "Error",
                            value: "error"
                        },
                        {
                            label: "Warning",
                            value: "warning"
                        },
                        {
                            label: "Info",
                            value: "info"
                        }
                    ],
                    filterMultiple: false
                },
                {
                    label: "Summary",
                    id: "summary",
                    type: "input",
                    span: 22,
                    formIndex: 3,
                    render: (h, param) => {
                        return h(
                            "router-link",
                            {
                                props: {
                                    to: `/alerts/${param.row
                                        .id}/details`
                                }
                            },
                            param.row.summary
                        );
                    }
                },
                {
                    label: "Created",
                    id: "created_at",
                    type: "select",
                    span: 22,
                    sortable: "custom",
                    clearable: true,
                    formIndex: 4,
                    render: (h, param) => {
                        return moment(param.row.created_at).format(
                            this.$t("date.dateTimeFull")
                        );
                    }
                },
                {
                    label: "Service",
                    id: "service",
                    type: "input",
                    span: 22,
                    formIndex: 5,
                    render: (h, param) => {
                        return h(
                            "router-link",
                            {
                                props: {
                                    to: `/services/${param.row.service.id}/detail/Incidents`
                                }
                            },
                            param.row.service.summary
                        );
                    }
                },
                {
                    label: "Action",
                    id: "action",
                    type: "input",
                    span: 22,
                    formIndex: 6,
                    // render: (h, params) => {
                    //   return ( <DropMenuDecorator id={params.row.id} select={this.operate} title='Operate' list={rowMenuList}></DropMenuDecorator> );
                    // },
                    render: (h, param) => {
                        return h(
                            "DropMenuDecorator",
                            {
                                props: {
                                    id: param.row.id,
                                    select: this.operate,
                                    title: this.$t("h.operate"),
                                    list: rowMenuList
                                }
                            },
                            "Operate"
                        );
                    }
                }
            ];
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            const columns = [...formUtil.columns()];
            let query = formUtil.defaultQuery();
            query.include = ["incident", "service", "integration"];
            const rowMenuList = [
                {title: this.$t("h.view"), icon: "eye", type: "view"},
                {title: this.$t("h.resolve"), icon: "checkmark-round", type: "resolve"},
                {
                    title: this.$t("h.movetoanotherincident"),
                    icon: "plus",
                    type: "MovetoAnotherIncident"
                }
            ];
            return {
                query,
                noDataText: "No alerts found with current filters.",
                queryForms: formUtil.forms(),
                incidentAlertList: {},
                visible: false,
                columns: columns,
                showColumns: columns,
                finalShowColumns: columns,
                resolveStatus: true,
                resolveSelect: [],
                modal: false,
                altersListFlag: false,
                filterFlag: false,
                incidentData: {},
                loading: false
            };
        }
    };
</script>
