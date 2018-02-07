<template>
    <Row type="flex">
        <Col span="24">
        <h1>Add an Integration</h1>
        <Row type="flex" style="width: 100%;border-bottom: 1px solid #e9eaec;border-top: 1px solid #e9eaec">
            <Col span="20">
            <DynamicForm :loading="loading" :dicts="dicts" ref="form" :editFields="editFields" :ruleValidate="ruleValidate" :formValidate="formValidate" :labelWidth="150" :button="{enabled:true}">
                <template slot="integrationType">
                    <Form-item :label="I18n('integration type')" prop="integrationType" style="position: relative" >
                        <Radio-group v-model="formValidate['integrationType']">
                            <!--<Radio label="Select a tool"></Radio>-->
                            <!--<Select :disabled="formValidate['integrationType']!=='Select a tool'?true:false" style="width: 150px;" placeholder="Select Tools" v-model="formValidate['select_tools']">-->
                                <!--<Option value="DataLog">DataLog</Option>-->
                            <!--</Select>-->
                            <!--<p style="margin-left: 20px;">We integrate with dozens of monitoring systems. This may involve configuration steps in your monitoring tool.</p>-->
                            <Radio label="Integrate via email"></Radio>
                            <p style="margin-left: 20px;">If your monitoring tool can send email, it can integrate with PagerDuty using a custom email address.</p>
                            <Radio label="Use our API directl"></Radio>
                            <p style="margin-left: 20px;">Use our API directly',description:'If you’re writing your own integration, use our Events API. More information is in our developer documentation.</p>
                            <!--<Select :disabled="formValidate['integrationType']!=='Use our API directl'?true:false" style="width: 150px;" placeholder="Select Tools" v-model="formValidate['select_api']">-->
                                <!--<Option value="DataLog">DataLog</Option>-->
                            <!--</Select>-->
                        </Radio-group>
                    </Form-item>
                </template>
                <template slot="integrationEmail">
                    <Form-item :label="I18n('integration email')" v-if="formValidate['integrationType'] === 'Integrate via email'" prop="integrationEmail">
                        <Input style="width: 400px;" v-model="formValidate['integrationEmail']" />
                        <p>Configure your monitoring tool to send email to the above address.</p>
                    </Form-item>
                </template>
            </DynamicForm>
            </Col>
        </Row>
        <Row style="margin-top: 8px">
            <Button type="success" @click="saveIntegration">Add Integration</Button>
            <Button type="ghost" style="margin-left: 8px" @click="cancle">cancle</Button>
        </Row>
        </Col>
    </Row>
</template>
<script>
import { VueUtil, FormUtil } from '@util';
export default {
    name:'IntegrationAdd',
    components: {},
    computed: {
        ...VueUtil(this).select(['ServiceIntegrations']).state(),
    },
    methods: {
        ...VueUtil(this).select(['ServiceIntegrations']).actions(),
        I18n(key){
            return VueUtil(this).I18n(key);
        },
        saveIntegration() {
            this.loading = true;
            this.$refs['form'].validate({
                ok: (data) => {
                    if (!data.id) {
                        VueUtil(this).select('ServiceIntegrations').save(data,this.beforeSaveOrUpdate);

                    } 
                },
                err: () => {
                    this.loading = false;
                }
            });
        },
        cancle() {
            this.$router.push(`/services/${this.$route.params.id}/detail/Integrations`);
        },
        listenIntegration(data) {

             VueUtil(this).cb(data).success(() => {
                    this.$Message.success(`${data.type} success!`);
                    this.$router.push(`/services/${this.$route.params.id}/detail/Integrations`);
                }).error();

        },
        beforeSaveOrUpdate(originalData){
            let data = _.cloneDeep(originalData);
            data.serviceId=this.$route.params.id;
            switch (data.integrationType){
                case 'Select a tool':
                    data.type="tool"
                    data.integration_email=data.select_tools
                    break
                case 'Integrate via email':
                    data.type="email"
                    data.integration_email=data.integrationEmail
                    break
                case 'Use our API directl':
                    data.type="API"
                    data.integration_email=data.select_tools
                    break
            }


            return data;
        },
        listenSelectState(data) {
            let disabled = {
                select_tools: true,
                select_api: true,
            };
            _.map(data, key => disabled[key] = false);
            this.disabled = disabled;
        }
    },
    mounted() {

    },
    watch: {
        'SelectState': 'listenSelectState',
        'ServiceIntegrations.save': 'listenIntegration'
    },
    data() {
        const monitoringToo = [
            { value: 1, label: 'JIRA Software' },
            { value: 2, label: 'Nagios' },
            { value: 3, label: 'Zabbix' },
            { value: 4, label: 'Airbrake' }
        ]
        let fields = [ {
            span: 18,
            label: 'Integration Name',
            type: 'input',
            style: { width: '400px' },
            id: 'name',
            rules: [
                { required: true, message: this.$t('valid.required'), trigger: 'blur' },
            ]
        }, {
            span: 18,
            label: 'Integration Types',
            type: "slot",
            id: 'integrationType',
            rules: [
                { required: true, message: this.$t('valid.required'), trigger: 'blur' }],
            style: { display: 'flex', flexDirection: 'column' },

        }, {
            span: 18,
            label: 'Integration Email',
            style: { width: '400px' },
            type: 'slot',
            id: 'integrationEmail',
            rules: [
                { required: true, message: this.$t('valid.required'), trigger: 'blur' },
                { type: 'email', message: this.$t('valid.email'), trigger: 'blur' },
            ]
        }]
        const dicts = {

        }
        const formUtil = FormUtil(this);
        formUtil.fields(fields);

        return {
            dicts,
            loading: false,
            editFields: formUtil.editFields(),
            formValidate: formUtil.forms(),
            ruleValidate: formUtil.rules()



        }
    }
}
</script>