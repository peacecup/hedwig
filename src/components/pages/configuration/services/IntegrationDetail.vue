<template>
    <div class="service">
        <Col span="20">
        <h2>{{ServiceIntegrations.get.data.name}}</h2>
        <Row style="width: 100%;border-top: 1px solid #e9eaec">
        <Row>
            <Col span="3" style="text-align: right"><strong>{{I18n('type')}}</strong></Col>
            <Col span="21">{{ServiceIntegrations.get.data.type}}</Col>
        </Row>
        <Row>
            <Col span="3" style="text-align: right"><strong>{{I18n('integration key')}}</strong></Col>
            <Col span="21">{{ServiceIntegrations.get.data.integration_key}}</Col>
        </Row>
        </Row>
        </Col>
        <Col span="4">
        <div class="service-buttons">
            <Button icon="edit" @click="toEditIntegration">Edit Integration</Button>
            <Button icon="log-out" @click="moveIntegration">Move to another service</Button>
            <Button icon="close" @click="deleteIntegration">Delete Integration</Button>
        </div>
        </Col>
        <MoveIntegrationEditForm 
        ref="moveIntegrationEditForm" 
        :modalTitle="modalTitle" 
        :integrationIdOnMoving="integrationIdOnMoving"></MoveIntegrationEditForm>
    </div>
</template>
<script>

import { VueUtil, FormUtil } from '@util';
import MoveIntegrationEditForm from './MoveIntegrationEditForm.vue';

export default {
    name: 'IntegrationDetail',
    components: {MoveIntegrationEditForm},
    computed: {
        ...VueUtil(this).select(['ServiceIntegrations','Services']).state(),
    },
    props: {},

    data() {
      
            const dicts = {

            }
        return {
            dicts,
            modalTitle:"",
            integrationIdOnMoving:""
        }
    },
    mounted() {
        VueUtil(this).select('ServiceIntegrations').get({
            id:this.$route.params.id,
            integrationId:this.$route.params.integrationId
        });

    },
    watch: {
        'ServiceIntegrations.update': 'listenIntegration',
        'ServiceIntegrations.get': 'listenIntegration',
        'ServiceIntegrations.delete': 'listenIntegration'
    },
    methods: {
        ...VueUtil(this).select(['ServiceIntegrations','Services']).actions(),
        I18n(key){
            return VueUtil(this).I18n(key);
        },
        toEditIntegration(){
            this.$router.push(`/services/${this.$route.params.id}/integration/${this.$route.params.integrationId}/edit`);
        },
        moveIntegration(){
            this.modalTitle = "Move '" + this.ServiceIntegrations.get.data.name + "' to another service";
            this.integrationIdOnMoving = this.$route.params.integrationId;
            this.$refs['moveIntegrationEditForm'].setModal(true);
            VueUtil(this).select("Services").list();
        },
         deleteIntegration() {
                    this.$Modal.confirm({
                        title: 'Confirm',
                        content: '<p>Are you sure you want to delete this integration?<br></p>Incidents from monitoring tools connecting to this integration will no longer be created.',
                        onOk: () => {
                             VueUtil(this).select('ServiceIntegrations').delete({
                                id:this.$route.params.id,
                                integrationId:this.$route.params.integrationId})
                              VueUtil(this).select('ServiceIntegrations').list({id:this.$route.params.id});
                             this.$router.push(`/services/${this.$route.params.id}/detail/Integrations`);
                        }
                    });

         },
         listenIntegration(data) {
                    VueUtil(this).cb(data).success(()=>{
                        if (data.type === 'get') {
                            this.formValidate = data.data;
                        } else {
                            this.$Message.success(`${data.type} success!`);
                            setTimeout(() => {
                                this.modal_moveIntegration = false;
                                this.loading = data.loading;
                                this.$router.push(`/services/${this.$route.params.id}/detail/Integrations`);
                            }, 600);
                        }
                    }).error();

                }    
            }
}
</script>