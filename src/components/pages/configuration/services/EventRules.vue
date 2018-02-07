<template>
    <Row>
        <Col span="24">
        <h2>{{I18n('event rules')}}</h2>
        <p>Event rules let you customize how your events and alerts are processed.</p>
        <p>
            Events are processed sequentially by these rules and stop processing after the first successful match. Re-order the rules by dragging and dropping them in a different order.</p>
        </Col>
        <Col span="24">
        <Button v-key="{key:`service.new_eventRule`,ignore:permission}" type="success" icon="plus"
                @click="gotoEventRuleEdit"> {{I18n('new event rules')}}

        </Button>
        </Col>
        <Col span="24">
        <Table size="small" :columns="columns"
               :data="Services.event_rules_list.data.list"></Table>
        </Col>
    </Row>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';
    import DropMenuDecorator from '@common/DropMenuDecorator.vue';

    export default{
        name: 'EventRules',
        components: {},
        computed: {
            ...VueUtil(this).select(['Services']).state(),
        },
        props: {
            service: {type: Object, default: {}},
            permission: {
                type: [Boolean],
                default: null,
            }
        },
        mounted(){
            this.listenPermission();
        },

        data(){
            let fields = [
                {
                    id: 'name', label: 'name',
                    render: (h, param) => {
                        return h('div', [
                            h('strong', param.row.predicateSubject),
                            h('strong', {
                                style: {
                                    marginLeft: '10px',
                                }
                            }, param.row.predicateType),
                            h('span', {
                                style: {
                                    color: 'red',
                                    marginLeft: '10px',
                                }
                            }, param.row.predicateValue === null ? '' : `(${param.row.predicateValue})`)
                        ])
                    }
                },
                {
                    id: 'id',
                    label: 'actionsperformed',
                    render: (h, param) => {
                        return h('div', [_.map(param.row.eventRuleActions, action => {
                            return h('div', `${action.field} ${action.value ? 'to' : ''} ${action.value === null ? '' : action.value}`);
                        })])
                    }
                },
            ]
            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            let columns = formUtil.columns();

            return {
                columns,

            }
        },

        watch: {
            "Services.event_rules_delete": "listenEventRule",
            "Services.event_rules_change_order": "listenEventRule",
            "service": "listenService",
            "permission": 'listenPermission'
        },
        methods: {
            ...VueUtil(this).select(['Services']).actions(),
            I18n(key){
              return VueUtil(this).I18n(key);
            },
            listenPermission(){
                if (this.permission === null)
                    return;
                const rowMenuList = [
                    {
                        title: "up",
                        icon: "arrow-up-c",
                        type: 'up',
                        key: {key: `service.move_eventRule`, ignore: this.permission}
                    },
                    {
                        title: "down",
                        icon: "arrow-down-c",
                        type: 'down',
                        key: {key: 'service.move_eventRule', ignore: this.permission}
                    },
                    {
                        title: "edit",
                        icon: "edit",
                        type: 'edit',
                        key: {key: 'service.edit_eventRule', ignore: this.permission}
                    },
                    {
                        title: "delete",
                        icon: "trash-a",
                        type: 'delete',
                        key: {key: 'service.delete_eventRule', ignore: this.permission}
                    },
                ];
                this.columns.push({
                    title: '',
                    key: 'id',
                    render: (h, params) => {
                        return h(DropMenuDecorator, {
                            props: {
                                id: params.row.id,
                                select: this.operate,
                                title: 'Operate',
                                list: rowMenuList,
                            }
                        })
                    }
                })
            },

            gotoEventRuleEdit(){
                this.$router.push(`/services/${this.service.id}/eventrules`);
            },

            operate(id){
                var $id = id.split("/");
                switch ($id[0]) {
                    case 'up':
                        this.exchangeRuleOrder($id[1], 'up');
                        break;
                    case 'down':
                        this.exchangeRuleOrder($id[1], 'down');
                        break;
                    case 'edit':
                        this.$router.push(`/services/${this.$route.params.id}/eventrules/${$id[1]}`);
                        break;
                    case 'delete':
                        this.deleteEventRule($id[1]);
                        break;
                }
            },
            exchangeRuleOrder(ruleId, type){
                let id1 = ruleId, id2;
                let max = this.Services.event_rules_list.data.list.length;
                let index = _.indexOf(_.map(this.Services.event_rules_list.data.list, l => l.id), id1);
                if (type === 'up') {
                    if (index !== 0) {
                        id2 = this.Services.event_rules_list.data.list[index - 1].id;
                    } else
                        return;
                } else {
                    if (index !== max - 1) {
                        id2 = this.Services.event_rules_list.data.list[index + 1].id;
                    } else
                        return;
                }

                VueUtil(this).select('Services').action('event_rules_change_order', {
                    serviceId: this.service.id,
                    params: {
                        ruleId1: id1,
                        ruleId2: id2,
                    }
                })
            },
            deleteEventRule(id){

                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        VueUtil(this).select('Services').action('event_rules_delete', {
                            serviceId: this.service.id,
                            id: id,
                        });
                    }
                });

            },

            listenService(service){
                VueUtil(this).select("Services").action("event_rules_list", {
                    serviceId: service.id,
                })
            },
            listenEventRule(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'event_rules_delete') {
                        this.$Message.success(`delete event rule success!`);
                    }
                    this.listenService(this.service);
                }).error();
            }
        }
    }
</script>