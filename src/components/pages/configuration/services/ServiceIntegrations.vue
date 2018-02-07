<template>
    <Row>
        <Col span="24">
        <Button v-key="{key:`service.new_integration`, ignore:permission}" @click="newIntegrations" icon="plus"
                type="success">{{addBtn.title}}


        </Button>
        </Col>
        <Col span="24">
        <Table @on-sort-change="sortChange" size="small" :columns="columns"
               :data="ServiceIntegrations.list.data.list"></Table>
        </Col>
        <MoveIntegrationEditForm
                ref="moveIntegrationEditForm"
                :modalTitle="modalTitle"
                :integrationIdOnMoving="integrationIdOnMoving"></MoveIntegrationEditForm>
    </Row>
</template>
<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';
    import DropMenuDecorator from '@common/DropMenuDecorator.vue';
    import MoveIntegrationEditForm from './MoveIntegrationEditForm.vue';

    export default {
        name: 'ServiceIntegrations',
        components: {MoveIntegrationEditForm},
        computed: {
            ...VueUtil(this).select(['ServiceIntegrations', 'Services']).state()

        },
        props: {
            permission: {
                type: [Boolean],
                default: null,
            }
        },

        data() {
            let tableFields = [{
                id: 'integrationId',
                type: 'hidden',
            }, {
                label: 'name',
                id: 'name',
                render: (h, params) => {


                    return h('div', [
                            h('router-link', {
                                props: {
                                    to: "/services/" + this.$route.params.id + "/integration/" + params.row.id + "/detail"
                                }
                            }, params.row.name)
                        ]
                    );
                }
            },
                {
                    label: 'Integration Key',
                    id: 'integration_key',
                },
                {
                    label: 'Type',
                    id: 'type',
                }
            ];

            const tableFormUtil = FormUtil(this);
            tableFormUtil.fields(tableFields);
            let query = tableFormUtil.defaultQuery();
            const dicts = {}
            let columns = tableFormUtil.columns();

            return {
                query,
                dicts,
                modalTitle: "",
                integrationIdOnMoving: null,
                modal_moveIntegration: false,
                modal_delete: false,
                loading: false,
                extensionsTitle: 'Extensions',
                addBtn: {title: "New Integration"},
                columns: columns,

            }
        },
        mounted() {
            VueUtil(this).select('ServiceIntegrations').list({id: this.$route.params.id});
            this.currentTab = this.$route.name || "ServiceIntegrations";
            this.setOperator();
        },
        watch: {
            'ServiceIntegrations.update': 'listenIntegration',
            'ServiceIntegrations.get': 'listenIntegration',
            'ServiceIntegrations.delete': 'listenIntegration',
            permission(oldV,newV){
                if(oldV !== newV){
                    this.setOperator();
                }
            }
        },
        methods: {
            ...VueUtil(this).select(['ServiceIntegrations', 'Services']).actions(),

            setOperator(){
                if(this.permission === null) return;
                const rowMenuList = [
                    {title: "view", icon: "search", type: 'view'},
                    {
                        title: "edit",
                        icon: "edit",
                        type: 'edit',
                        key: {key: 'service.edit_integration', ignore: this.permission}
                    },
                    {
                        title: "Move to another service",
                        icon: "log-out",
                        type: 'moveTargetService',
                        key: {key: 'service.new_integration', ignore: this.permission}
                    },
                    {
                        title: "delete", icon: "trash-a", type: 'delete',
                        key: {key: 'service.delete_integration', ignore: this.permission}
                    },
                ]
                this.columns.push({
                    render: (h, params) => {
                        return h('DropMenuDecorator', {
                            props: {
                                id: params.row.id + '/' + params.row.name,
                                select: this.operate,
                                title: 'Operate',
                                list: rowMenuList,
                            }
                        })
                    }
                });
            },

            sortChange({key, order}) {
                this.query = {...this.query, sortField: key, sortOrder: order};
            },
            newIntegrations() {
                this.$router.push(`/services/${this.$route.params.id}/integration/add`);
            },

            operate(id) {
                var $id = id.split("/");
                switch ($id[0]) {
                    case 'view':
                        this.$router.push(`/services/${this.$route.params.id}/integration/${$id[1]}/detail`);
                        break;
                    case 'edit':
                        this.$router.push(`/services/${this.$route.params.id}/integration/${$id[1]}/edit`);
                        break;
                    case 'moveTargetService':
                        this.moveIntegration($id);

                        break;
                    case 'delete':
                        this.deleteIntegration(_.parseInt($id[1]));

                        break;
                }
            },
            cancle() {
                this.modal_delete = false;
            },
            moveIntegration(data) {
                var integrationName = data[2];

                this.integrationIdOnMoving = data[1];
                this.modalTitle = "Move '" + integrationName + "' to another service";
                this.loading = false;

                this.$refs['moveIntegrationEditForm'].setModal(true);
                VueUtil(this).select("Services").list();
            },
            beforeSaveOrUpdate(originalData){
                let data = _.cloneDeep(originalData);
                data.service = {};
                data.service.id = data.targetServiceId;
                data.serviceId = this.$route.params.id;
                data.integrationId = this.integrationIdOnMoving;


                return data;
            },
            deleteIntegration(id) {
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure you want to delete this integration?<br></p>Incidents from monitoring tools connecting to this integration will no longer be created.',
                    onOk: () => {
                        VueUtil(this).select('ServiceIntegrations').delete({
                            id: this.$route.params.id,
                            integrationId: id
                        });
                    }
                });

            },
            listenIntegration(data) {
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'get') {
                        this.formValidate = data.data;
                    } else {
                        this.$Message.success(`${data.type} success!`);
                        setTimeout(() => {
                            this.modal_moveIntegration = false;
                            this.loading = data.loading;
                            VueUtil(this).select('ServiceIntegrations').list({
                                id: this.$route.params.id
                            });
                        }, 600);
                    }
                }).error();

            }

        }
    }
</script>