<template>
    <div class="api-access-form">
        <Modal width="600px" v-model="modal_newToken" :mask-closable="false" :title="modalTitle" :loading="loading" @on-ok="saveAPIAccess">
            <DynamicForm :dicts="dicts" :button="{enabled:false}" ref="form" :editFields="editFields" :ruleValidate="ruleValidate" :formValidate="formValidate">
                <div slot="footer">
                    <Button type="primary" size="large" :loading="loading" @click="saveAPIAccess">{{ $t('button.submit')}}</Button>
                </div>
            </DynamicForm>
        </Modal>
         <Modal width="600px" v-model="modal_info" :mask-closable="false" :title="modalTitle" :loading="loading" @on-ok="saveAPIAccess">
         <Alert type='warning'>This key will not be visible again.</Alert>
            <p>Here is your new API User token:</p>
            <br/>
            <Col span="8">
            <strong>API User Token</strong>
            </Col>
            <Col span="16">
            <span>{{APIAccess.save.data.apiTokenKey}}</span>
            </Col>
            <Col span="8">
            <strong>Description</strong>
            </Col>
            <Col span="16">
            <span>{{APIAccess.save.data.description}}</span>
            </Col>
            <br/><br/>
            <p>Copy this API User Token into any application that needs access to the Hedwig API.</p>
            <p>Just like your own password, this key lets an application modify your Hedwig information.</p>
            <div slot="footer">
                   <Button size="large" @click="closeModalInfo">Close</Button>
                </div>
        </Modal>
    </div>
</template>
<script>
import { VueUtil, FormUtil } from '@util';

export default {
    name: 'APIAccessEditForm',
    components: {},
    computed: {
        ...VueUtil(this).select(['APIAccess']).state(),
    },
    props: [
        'users',
    ],

    watch: {
        'modal_newToken': 'listenModal',
        'APIAccess.save': 'listenAPIAccess'
    },

    data() {
        const checkbox=this.users?"":"checkbox";
        const fields = [{
            id: 'id',
            label: 'id',
            type: 'hidden'
        }, {
            id: "description",
            label: "Description",
            type: 'textarea',
            span: 24,
        }, {
            id: "readonly",
            label: '',
            type: checkbox,
            options: 'ReadOnly',
            scope: ['form'],
            span: 24,
        }]
        let formUtil = FormUtil(this).initFields(fields);
        return {
            modalTitle: "Create API Key",
            modal_newToken: false,
            modal_info:false,
            dicts: {
                ReadOnly: [{ label: 'Read-only API Key', value: '1' }]
            },
            loading: false,
            editFields: formUtil.editFields(),
            formValidate: formUtil.forms(),
            ruleValidate: formUtil.rules(),
        }
    },
    mounted() {},

    methods: {
        ...VueUtil(this).select(['APIAccess']).actions(),

        listenModal(modal) {
            if (!modal) {
                this.$refs['form'].handleReset('formValidate');
            }
        },
        setModal(modal) {
            this.modal_newToken = modal;
        },
        saveAPIAccess() {
            
            this.$refs['form'].validate({
                ok: (data) => {
                         VueUtil(this).select('APIAccess').save(data, this.beforeSaveOrUpdate);
                         this.loading = true;
                },
                err: () => {
                    this.loading = false;
                }
            });
        },
        closeModalInfo(){
            this.modal_info=false;
        },
         beforeSaveOrUpdate(originalData){
            let data = _.cloneDeep(originalData);
            if(this.users){
                data.accessLevel='User';
                data.userId=this.$route.params.id;
            } else  {
                data.accessLevel=data.readonly[0]?'Read-only':'Full access';
            }
            data.keyState="enabled";

            return data;
        },
        listenAPIAccess(data) {
            VueUtil(this).cb(data).success(() => {
                this.$Message.success(`${data.type} success!`);
                this.loading = false;
                this.modal_info=true;
                  VueUtil(this).select('APIAccess').action('list',{
                    userId:this.$route.params.id
                });

            }).error();
            

        },
    }
}
</script>