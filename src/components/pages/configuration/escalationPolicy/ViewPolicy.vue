<template>
    <div class="policy">
        <Card :bordered="showRelation" :dis-hover="!showRelation">
            <template v-if="showRelation">
                <p slot="title" v-if="showRelation">
                    <Icon type="arrow-up-a"></Icon>
                    <permission-router-link type="policy" :target="escalationPolicy">{{escalationPolicy.name}}</permission-router-link>
                </p>
                <div slot="extra" v-if="showRelation">
                    <DropMenuDecorator :id="escalationPolicy.id" :select="configurate"
                                       :list="configruationList" target="escalationPolicy"></DropMenuDecorator>
                </div>
            </template>
            <div class="card_content">
                <Row type="flex" justify="space-between" aling="center">
                    <Col :span="contentWidth">
                    <Timeline>
                        <TimelineItem color="green">
                            <div class="step_icon" slot="dot">
                                <Icon type="alert" slot="dot"></Icon>
                            </div>
                            <policy-step status="begin"></policy-step>
                        </TimelineItem>
                        <template v-for="(rule,index) in escalationPolicy.escalation_rules">
                            <TimelineItem>
                                <div class="step_icon" slot="dot"><h3>{{index + 1}}</h3></div>
                                <policy-step status="rule" :rule="rule" :users="Users.all.data.list"
                                             :schedules="Schedules.all.data.list"></policy-step>
                            </TimelineItem>
                        </template>
                        <TimelineItem>
                            <div class="step_icon" slot="dot">
                                <Icon type="arrow-swap" slot="dot" :color="repeatColor"></Icon>
                            </div>
                            <policy-step status="end"
                                         :old_repeat_enabled="escalationPolicy.repeat_enabled"
                                         :old_num_loops="escalationPolicy.num_loops"></policy-step>
                        </TimelineItem>
                    </Timeline>
                    </Col>
                    <Col span="6" v-if="showRelation">
                    <div class="used_service_or_team">
                        <template v-if="!escalationPolicy.services.length">
                            <div class="used_service">No services are using this policy.</div>
                        </template>
                        <template v-else>
                            <h4>used by {{escalationPolicy.services.length}} service</h4>
                            <ul>
                                <li v-for="service in escalationPolicy.services">
                                    <permission-router-link :target='service' type="service">{{service.summary}}
                                    </permission-router-link>
                                </li>
                            </ul>
                        </template>
                    </div>
                    <div class="used_service_or_team">
                        <template v-if="!escalationPolicy.teams.length">
                            <div class="used_service">No teams are associated with this escalation policy.</div>
                        </template>
                        <template v-else>
                            <h4>used by {{escalationPolicy.teams.length}} team</h4>
                            <ul>
                                <li v-for="team in escalationPolicy.teams">

                                    <router-link :to='"/teams/"+team.id+"/detail"'>{{team.summary}}</router-link>
                                </li>
                            </ul>
                        </template>
                    </div>
                    </Col>
                </Row>
            </div>
        </Card>
    </div>
</template>

<script scoped>

    import policyStep from './policyStep.vue';
    import DropMenuDecorator from '@common/DropMenuDecorator.vue';
    import {VueUtil,PermissionUtil} from '@util';
    import PermissionRouterLink from "../../../common/PermissionRouterLink";
    export default {
        name: "ViewPolicy",
        data(){
            let rowMenuList = [
                {title: "View", icon: "eye", type: 'view', key: {key:'escalationPolicy.read'}},
                {title: "Edit", icon: "edit", type: 'edit', key: {key:'escalationPolicy.edit'}},
                {title: "Delete", icon: "android-delete", type: 'delete', key: {key:'escalationPolicy.delete'}},
            ]
            return {
                configruationList: rowMenuList,
            };
        },
        props: {
            showRelation: {
                type: Boolean, required: true,
            },
            escalationPolicy: {
                type: Object, required: true,
            },
            delEscalationPolicy: {}
        },
        computed: {
            ...VueUtil(this).select(['EscalationPolicies', 'Schedules', 'Users']).state(),
            contentWidth() {
                return this.showRelation ? 17 : 24;
            },
            repeatColor(){
                return this.escalationPolicy.repeat_enabled ? "" : "#d6d6d6";
            }
        },
        components: {
            PermissionRouterLink, policyStep, DropMenuDecorator
        },
        methods: {
            ...VueUtil(this).select(['EscalationPolicies', 'Schedules', 'Users']).actions(),
            configurate(id){
                var $id = id.split("/");
                switch ($id[0]) {
                    case 'view':
                        this.$router.push(`/policies/${$id[1]}/detail`);
                        break;
                    case 'edit':
                        this.$router.push(`/policies/${$id[1]}/edit`);
                        break;
                    case 'delete':
                        this.$Modal.confirm({
                            title: 'Confirm',
                            content: '<p>Are you sure?</p>',
                            onOk: () => {
                                this.delEscalationPolicy(this.escalationPolicy.id)
                            }
                        });
                        break;
                }
            }
        },
        watch: {

        },
        mounted(){
            VueUtil(this).select('Users').action('all')
                         .select('Schedules').action('all');


        }
    };
</script>

<style lang="less" scoped>
    .policy {
        width: 100%;
        margin-bottom: 20px;
        .ivu-card-extra {
            top: 5px;
        }
        .card_content {
            width: 100%;
            height: 100%;
            font-size: 12px;
            padding: 5px;
            .used_service_or_team {
                margin-bottom: 15px;
                border: 1px solid #ddd;
                -webkit-border-radius: 5px;
                -moz-border-radius: 5px;
                border-radius: 5px;
                padding: 10px;
                ul {
                    list-style: disc outside;
                    padding-left: 15px;
                    font-size: 13px;
                    color: #005c9c;
                    li {
                        line-height: 18px;
                        padding: 2px;
                        cursor: pointer;
                        text-decoration: none;
                    }
                }
            }
        }
    }

</style>