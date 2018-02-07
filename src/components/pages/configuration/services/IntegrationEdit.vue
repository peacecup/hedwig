<template>
    <Row type="flex" v-pageKey="{key:'edit_integration',ignore:allowEdit}">
        <Col span="24">
        <h1>Edit Integration</h1>
        <Row type="flex" style="width: 100%;border-bottom: 1px solid #e9eaec;border-top: 1px solid #e9eaec">
            <DynamicForm :loading="loading" ref="form" :editFields="editFields" :ruleValidate="ruleValidate" :formValidate="formValidate" :labelWidth="150" :button="{enabled:true}">
                <template slot="type">
                    <Form-item :label="$t('h.type')" prop="type">
                        <span>{{ServiceIntegrations.get.data.type}}</span>
                    </Form-item>
                </template>
                <template slot="type">
                    <Form-item :label="I18n('integration key')" prop="integrationKey">
                        <span>{{ServiceIntegrations.get.data.integration_key}}</span>
                        <Button type="success" @click="changeKey"> Generate a new integration key</Button>
                    </Form-item>
                </template>
            </DynamicForm>
        </Row>
        <Row style="margin-top: 8px">
            <Button type="success" @click="saveChange">Save Change</Button>
            <Button type="ghost" @click="cancle" style="margin-left: 8px">cancle</Button>
        </Row>
        </Col>
    </Row>
</template>
<script>
import { VueUtil, FormUtil ,PermissionUtil} from '@util';

export default {
    name: 'IntegrationEdit',
    components: {},
    computed: {
        ...VueUtil(this).select(['ServiceIntegrations']).state(),
        allowEdit(){
            return PermissionUtil.service.allowEdit({id:this.$route.params.id});
        }
    },
    props: {},

    data() {
        let fields = [{
            id: 'id',
            type: 'hidden',
        }, {
            span: 18,
            label: 'Name',
            placeholder: "ServiceIntegrations.get.data.name",
            type: 'input',
            style: { width: '400px' },
            id: 'name',
            rules: [
                { required: true, message: this.$t('valid.required'), trigger: 'blur' },
            ]
        }, {
            label: 'Type',
            span: 18,
            type: 'slot',
            id: 'type',
        }, {
            label: 'Integration Key',
            span: 18,
            type: 'slot',
            id: 'key',
        }]
        const formUtil = FormUtil(this);
        formUtil.fields(fields);

        return {
            loading: false,
            editFields: formUtil.editFields(),
            formValidate: formUtil.forms(),
            ruleValidate: formUtil.rules()

        }
    },
    mounted() {
        VueUtil(this).select('ServiceIntegrations').get({
            id:this.$route.params.id,
            integrationId:this.$route.params.integrationId
        });

    },
    watch: {
        'ServiceIntegrations.get': 'listenIntegration',
        'ServiceIntegrations.save': 'listenIntegration',
        'ServiceIntegrations.changeKey': 'listenIntegration',
        'ServiceIntegrations.update': 'listenIntegration'
    },
    methods: {
        ...VueUtil(this).select(['ServiceIntegrations']).actions(),
        I18n(key){
            return VueUtil(this).I18n(key);
        },
        saveChange(data) {
            this.loading = true;
            this.$refs['form'].validate({
                ok: (data) => {
                    if (!!data.id){
                        data.integrationId=1;
                        VueUtil(this).select('ServiceIntegrations').update(data,this.beforeSaveOrUpdate);
                        this.$router.push(`/services/${this.$route.params.id}/detail/Integrations`);
                    }

                    else
                        VueUtil(this).select('ServiceIntegrations').save(data,{
            id:this.$route.params.id
        });
                },
                err: () => {
                    this.loading = false;
                }
            });
        },
        cancle() {
            this.$router.push(`/services/${this.$route.params.id}/detail`);
            },
        changeKey() {
            this.$Modal.confirm({
                        title: 'Confirm',
                        content: '<p>Are you sure you want to generate a new integration key?</p>',
                        onOk: () => {
                             VueUtil(this).select('ServiceIntegrations').action("changeKey",{
                                id:this.$route.params.id,
                                integrationId:this.$route.params.integrationId
                            });
                              VueUtil(this).select('ServiceIntegrations').get({
                                id:this.$route.params.id,
                                integrationId:this.$route.params.integrationId
                            });
                        }
                    });
        },
        beforeSaveOrUpdate(originalData){
            let data = _.cloneDeep(originalData);
            data.integrationId=this.$route.params.integrationId;
            return data;
            },
        listenIntegration(data) {
            VueUtil(this).cb(data).success(()=>{
                if (data.type === 'get') {
                    this.formValidate = data.data;
                } else {
                    this.$Message.success(`${data.type} success!`);
                    setTimeout(() => {
                        this.modal = false;
                    }, 600);
                }
            }).error();
        }

    }
}
</script>