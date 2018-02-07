<template>
    <div class="policy_detail" v-pageKey="{key:'escalationPolicy.read',ignore:isOwner || isManager}">
        <Row>
            <Col span="20">
                <Row>
                    <h1 >{{EscalationPolicies.get.data.name}}</h1>
                </Row>
                <div class="divider"></div>
                <Row>
                    <p v-if="EscalationPolicies.get.data.description"><strong style="font-size:13px;margin-top:5px;">description:</strong>{{EscalationPolicies.get.data.description}}</p>
                </Row>
                <Row>
                    <view-policy :showRelation="false" :escalationPolicy="EscalationPolicies.get.data"></view-policy>
                </Row>
            </Col>
            <Col span="4">
                <Button v-key="{key:'escalationPolicy.edit',ignore:isManager}" long icon="edit" @click="editEscalationPolicy">Edit Escalation Policy</Button>
                <br><br>
                <Card>
                    <p slot="title">Inbound Services</p>
                    <ul>
                        <li v-for="service in EscalationPolicies.get.data.services">
                            <permission-router-link :target="service" type="service">{{service.summary}}</permission-router-link>
                        </li>
                    </ul>
                </Card>
                <br>

            </Col>
        </Row>
    </div>
</template>

<script scoped>
    import ViewPolicy from './ViewPolicy.vue';
    import {VueUtil,PermissionUtil} from '@util';
    export default {
        computed:{
            ...VueUtil(this).select(['EscalationPolicies']).state(),
            isManager(){
                return PermissionUtil.escalationPolicy.isManager({id: this.$route.params.id});
            },
            isOwner(){
                return PermissionUtil.escalationPolicy.isOwner(this.EscalationPolicies.get.data);
            }
        },
        components:{
            ViewPolicy
        },
        methods:{
            ...VueUtil(this).select(['EscalationPolicies']).actions(),
            editEscalationPolicy(){
                this.$router.push("/policies/"+this.$route.params.id+"/edit");
            }
        },
        mounted(){
            VueUtil(this).select('EscalationPolicies').get({ id: this.$route.params.id, include: ["teams","services","targets"]});
        }       
    };
</script>

