<template>
    <div class="oncall">
        <Spin fix size="large" v-if="EscalationPolicies.list.loading"></Spin>
        <div v-if="type === 'text'">
            <div v-for="policy in policies">
                <div class="title"><strong>
                    <Icon type="arrow-up-a"></Icon>
                    <permission-router-link :target="policy" type="policy">{{policy.name}}</permission-router-link>
                </strong></div>
                <p>Level {{ policy.level }}</p>
                <p> on-call all the time</p>
            </div>
        </div>
        <div v-else-if="type === 'chart'">
            <Row type="flex" v-if="policies !== null && policies.length > 0">
                <Col :style="`border-right:1px dashed #333;width:30px;height: ${policies.length * 30 + 250}px;`">
                    <div class="timeline" :style="`height: ${policies.length * 30 + 200}px;background:${user.color};`"></div>
                </Col>
                <Col style="padding-left:20px;">
                    <div v-for="policy in policies">
                        <strong>
                            <permission-router-link :target="policy" type="policy">{{policy.name}}</permission-router-link>
                        </strong>
                        <p>Level {{ policy.level }}</p>
                    </div>
                </Col>
            </Row>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'UpcomingOnCall',
        components: {},
        computed: {
            ...VueUtil(this).select(['EscalationPolicies']).state(),
        },
        props: {
            user: {
                type: Object,
            },
            type: {
                type :String,
                default: 'text',
            }
        },
        destroyed(){
          VueUtil(this).select('EscalationPolicies').clear('list');
        },

        data(){
            return {
                policies: null,
            }
        },
        mounted(){
        },
        watch: {
            user(val) {
                this.getEscalationPoliciesByUser(val);
            },
            'EscalationPolicies.list': 'listenEscalationPolicies',
        },
        methods: {
            ...VueUtil(this).select(['EscalationPolicies']).actions(),
            getEscalationPoliciesByUser(user){
                VueUtil(this).select('EscalationPolicies').list({
                    ids: [user ? user.id : this.user.id],
                    include: ['targets']
                });
            },
            listenEscalationPolicies(data){
                VueUtil(this).cb(data).success(() => {
                    if (data.type === 'list') {
                        _.forEach(data.data.list, (policy) => {
                            policy.level = this.calculateLevel(policy);
                        });
                        this.policies = _.sortBy(data.data.list, policy => policy.level);
                    }
                }).error();
            },
            calculateLevel(policy, type) {
                let level = 0;
                _.forEach(policy.escalation_rules, (rule, index) => {
                    let has = _.chain(rule.targets).filter(target => target.type === (type || 'user_reference')).map(target => target.id).includes(this.user.id).value();
                    if (has) {
                        level = index + 1;
                    }
                })
                return level;
            },

        }
    }
</script>