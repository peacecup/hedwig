<template>
<div class="alerts">
  <Row type="flex" style="flex-wrap:nowrap;">
    <Col span="20" style="flex:1 1 auto;">
    <Row type="flex" style="width: 100%;border-bottom: 1px solid #e9eaec">
      <Col span="16">
        <h1>{{$t('h.alerts')}}</h1>
      </Col>
      <Col span="8">
      </Col>
    </Row>
    <Row type="flex">
      <Col span="24">
      <div style="float: right;">
        <Page :page-size="query.limit" :total="Alerts.list.data.total" :current="Alerts.list.data.offset" size="small" @on-change="changePage" @on-page-size-change="changePageSizer" show-total show-sizer></Page>
      </div>
      </Col>
      <Col span="12">
        <Button @click="changeStatus" :disabled="selectRow">
          {{$t('h.resolve')}}
        </Button>
      </Col>
      <Col span="12" class="text-align-right">
      <CheckboxGroup v-model="showColumns">
        <Dropdown trigger="custom" :visible="visible">
          <Button @click="handleOpen">{{ $t('h.customizecolumns') }} <Icon type="arrow-down-b"></Icon></Button>
          <DropdownMenu slot="list">
            <DropdownItem :key="column.title" v-for="column in columns" class="text-align-left">
              <Checkbox v-if="column.id" style="width: 100%;" :label="column" :disabled="column.forever">
                {{column.title}}
              </Checkbox>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CheckboxGroup>
      <div class="mask-layer" v-if="visible" @click="handleClose"></div>
      </Col>
      <Col span="24">
      <Table :loading="loading" :no-filtered-data-text="noDataText" :no-data-text="noDataText" @on-sort-change="sortChange" @on-selection-change="selectionChange" size="small" :columns="finalShowColumns" :data="Alerts.list.data.list">
      </Table>
      </Col>
      <Col span="24">
      <div style="float: right;">
        <Page :page-size="query.limit" :total="Alerts.list.data.total" :current="Alerts.list.data.offset" size="small" @on-change="changePage" @on-page-size-change="changePageSizer" show-total show-sizer></Page>
      </div>
      </Col>
    </Row>
    </Col>
  </Row>
</div>
</template>
<script>
import { VueUtil, FormUtil, Dicts } from "@util";
import _ from "lodash";
import moment from "moment";

export default {
  components: {},
  computed: {
    ...VueUtil(this)
      .select(["Alerts"])
      .state()
  },
  methods: {
    ...VueUtil(this)
      .select(["Alerts"])
      .actions(),
    sortChange({ key, order }) {
      this.query = {
        ...this.query,
        sortField: key,
        sortOrder: order
      };
      this.changePage();
    },
    changePage(page) {
      if (_.isNumber(page)) {
        this.query = {
          ...this.query,
          sortField: 'created_at',
          sortOrder: 'desc'
        };
        this.query.offset = page;
      }
      this.query = _.assign(this.query, {
        ...this.queryForms
      });
      this.loading = true;
      VueUtil(this)
        .select("Alerts")
        .list(this.query);
    },
    changePageSizer(pageSize) {
      this.query.limit = pageSize;
      this.loading = true;
      VueUtil(this)
        .select("Alerts")
        .list(this.query);
    },
    listenAlerts(data) {
      VueUtil(this)
        .cb(data)
        .success(() => {
          this.loading = false;
        })
        .error();
    },
    listenUpdate(data) {
      VueUtil(this)
        .cb(data)
        .success(() => {
          this.loading = true;
          this.$Message.success(`${data.type} success!`);
          this.changePage();
        })
        .error();
    },
    handleOpen() {
      this.visible = true;
    },
    handleClose() {
      this.visible = false;
    },
    changeStatus() {
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
    selectionChange(rows) {
      let arr = [];
      for (let num in rows) {
        if ("triggered" === rows[num].status) {
            this.selectRow = false;
            arr.push(rows[num]);
        } else {
            this.selectRow = true;
        }  
      }
      this.selectRows = arr;
    }
  },
  watch: {
    "Alerts.list": "listenAlerts",
    "Alerts.update": "listenUpdate",
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
  // 挂载完毕请求数据
  mounted() {
    this.changePage(1);
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
        forever: true,
        span: 22,
        formIndex: 1,
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
        label: "ACTIONABILITY",
        id: "actionability",
        type: "select",
        forever: true,
        clearable: true,
        span: 22,
        formIndex: 2,
        scope: ["searchForm"],
        options: [
          {
            label: "Actionable only",
            value: 1
          },
          {
            label: "Suppressed only",
            value: 2
          },
          {
            label: "Actionable & Suppressed",
            value: 3
          }
        ]
      },
      {
        label: "Severity",
        id: "severity",
        type: "select",
        forever: true,
        clearable: true,
        span: 22,
        formIndex: 3,
        filterRemote: (value, row) => {
          this.queryForms.severity = value.length === 1 ? [value[0]] : null;
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
        forever: true,
        formIndex: 4,
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
        forever: true,
        sortable: "custom",
        clearable: true,
        span: 22,
        formIndex: 5,
        render: (h, param) => {
          return moment(param.row.created_at).format(
            this.$t("date.dateTimeFull")
          );
        }
      },
      {
        label: "Related Incident",
        id: "incident",
        type: "input",
        span: 22,
        formIndex: 6,
        render: (h, param) => {
          return h(
            "router-link",
            {
              props: {
                to: `/incidents/${param.row.incident.id}/Details`
              }
            },
            param.row.incident.summary
          );
        }
      },
      {
        label: "Service",
        id: "service",
        type: "input",
        //sortable: 'custom',
        span: 22,
        formIndex: 7,
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
        label: "Integration",
        id: "integration",
        type: "input",
        //sortable: 'custom',
        span: 22,
        formIndex: 8,
        render: (h, param) => {
          return h(
            "router-link",
            {
              props: {
                to: `/services/${param.row.service.id}/integration/${param.row
                  .integration.id}/detail/`
              }
            },
            param.row.integration.summary
          );
        }
      },
      {
        label: "Source",
        id: "source",
        type: "input",
        span: 22,
        formIndex: 9
      }
    ];
    const formUtil = FormUtil(this);
    formUtil.fields(fields);
    let query = formUtil.defaultQuery();
    query.include = ["incident", "service", "integration"];
    const dicts = {
      Roles: [],
      Teams: []
    };
    const columns = [...formUtil.columns()];
    return {
      visible: false,
      query,
      dicts,
      noDataText: "No alerts found with current filters.",
      loading: false,
      editFields: formUtil.editFields(),
      queryFields: formUtil.queryFields(),
      formValidate: formUtil.forms(),
      queryForms: formUtil.forms(),
      ruleValidate: formUtil.rules(),
      columns: columns,
      showColumns: columns,
      finalShowColumns: columns,
      selectRows: [],
      selectRow: true
    };
  }
};
</script>
