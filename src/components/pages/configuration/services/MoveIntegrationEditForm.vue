<template>
    <div class="move-integration-form">
        <Modal  width="600px" v-model="modal_moveIntegration" :mask-closable="false" :title="modalTitle" :loading="loading">
            <p>Moving an integration will also move all its incidents to the destination service. </p>
            <p>You can learn more about moving integrations in our knowledge base.</p>
            <h4>Destination Service</h4>
            <Row>
                <DynamicForm :button="{enabled:true}" :dicts="dicts" ref="form" :editFields="editFields" :formValidate="formValidate"></DynamicForm>
            </Row>
            <div slot="footer">
                <Button type="success" :loading="loading" size="large" @click="saveChange">Move Integration</Button>
                <Button size="large" :loading="loading" @click="cancle">Cancle</Button>
            </div>
        </Modal>
        
    </div>
</template>
<script>
import { VueUtil, FormUtil } from '@util';

export default {
     name: 'MoveIntegrationEditFrom',
     components: {},
     computed: {
         ...VueUtil(this).select(['ServiceIntegrations', 'Services']).state()
     },
     props: [
        'modalTitle',
        'integrationIdOnMoving'
     ],
     data() {

            let modalFields = [{
                label: '',
                id: 'targetServiceId',
                type: 'select',
                placeholder: 'Select a Service',
                options: "destinationService",
                rules: [{ required: true }]
            }];

            const modalFormUtil = FormUtil(this);
            modalFormUtil.fields(modalFields);

            const dicts = {

            }

            return {
                dicts,
                modal_moveIntegration:false,
                loading:false,
                editFields: modalFormUtil.editFields(),
                formValidate: modalFormUtil.forms(),
                ruleValidate: modalFormUtil.rules(),

            }
     },
     mounted() {
        VueUtil(this).select("Services").list();
     },
     watch: {
        'ServiceIntegrations.update': 'listenIntegration',
        'Services.list': 'listenServices'
     },
     methods: {

         ...VueUtil(this).select(['ServiceIntegrations', 'Services']).actions(),

        saveChange() {
            this.loading = true;
            this.$refs['form'].validate({
                ok: (data) => {
                    if(!!data.targetServiceId) {
                         VueUtil(this).select('ServiceIntegrations').update(data,this.beforeSaveOrUpdate);
                    } 
                },
                err: () => {
                    this.loading = false;
                }
            });
        },
        setModal(modal) {
            this.modal_moveIntegration = modal;
        },
        cancle() {
            this.modal_moveIntegration = false;
        },
        beforeSaveOrUpdate(originalData){
            let data = _.cloneDeep(originalData);
            data.service={};
            data.service.id=data.targetServiceId;
            data.serviceId=this.$route.params.id;
            data.integrationId=this.integrationIdOnMoving;
            return data;
        },
        listenServices(data) {
            if(!data.loading) {
                if(!data.error) {
                    this.dicts = {
                        destinationService: _.map(data.data.list, d => {
                            return { 
                                value: d.id, 
                                label:d.name
                            }
                        })
                    }
                }
            }
        },
        listenIntegration(data) {
            VueUtil(this).cb(data).success(()=>{
                if (data.type === 'get') {
                    this.formValidate = data.data;
                } else {

                    
                    setTimeout(() => {
                        this.modal_moveIntegration = false;
                            }, 600);
                        }
                    }).error();

                }
     }
}
</script>