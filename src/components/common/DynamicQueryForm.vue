<template>
    <Form ref="queryForm" :model="queryForms" :label-width="80" onSubmit="return false" @on-submit="submit">
        <Row>
            <i-col :style="{display:field.type === 'hidden'?'none':'block'}" class v-for="field in queryFields" :key="field.id"
                   :span="24">
                <Form-item :label="$t(`h.${field.label}`)" :prop="field.id">
                    <Input type="hidden" v-if="field.type === 'hidden'" v-model="queryForms[field.id]"></Input>
                    <Input v-if="field.type === 'input'" v-model="queryForms[field.id]"
                           size="small"
                           :placeholder="`search ${field.label}`">
                    <Button :disabled="queryForms[field.id] === ''" @click="clearField(field.id)" slot="append" size="small" icon="close"></Button>
                    </Input>
                    <Select :multiple='field.multiple'
                            :clearable="field.clearable || false"
                            :filterable="field.filterable || false"
                            v-else-if="field.type ==='select' || field.type ==='radio' || field.type ==='checkbox'" v-model="queryForms[field.id]"
                            :placeholder="`search ${field.label}`">
                        <Option v-for="option in field.options" :key="option.value" :value="option.value">{{option.label}}</Option>
                    </Select>
                    <Date-picker v-else-if="field.type ==='date'" type="date" :placeholder="`请选择${field.label}`"
                                 v-model="queryForms[field.id]"></Date-picker>
                    <Time-picker v-else-if="field.type ==='time'" type="time" :placeholder="`请选择${field.label}`"
                                 v-model="queryForms[field.id]"></Time-picker>
                    <Checkbox-group v-else-if="field.type ==='checkbox'" v-model="queryForms[field.id]">
                        <Checkbox :label="option.value"
                                  v-for="option in field.options"
                                  :key="option.value">{{option.label}}</Checkbox>
                    </Checkbox-group>
                    <Input v-else-if="field.type ==='textarea'" v-model="queryForms[field.id]" type="textarea"
                           :autosize="{minRows: 2,maxRows: 5}"
                           placeholder="search..."></Input>
                </Form-item>
            </i-col>
            <i-col class
                   :span="24" style="text-align: right">
                    <Button type="primary" @click="submit" htmlType="submit" icon="search">Search</Button>
                    <Button @click="handleReset('queryForm')">{{ $t('button.reset')}}</Button>
            </i-col>
        </Row>
    </Form>
</template>
<script>
    export default {
        name: 'DynamicqueryForms',
        components: {},
        props: [
            'queryForms',
            'submit',
            'queryFields',
            'clearField',
        ],
        data () {
            return {}
        },
        mounted(){
          this.handleReset('queryForm')
        },
        methods: {
            validate(cb){
                this.$refs['queryForm'].validate((valid) => {
                    if (valid) {
                        !!cb.ok && cb.ok.call(this, this.submit);
                    } else {
                        this.$Message.error('表单验证失败!');
                        !!cb.err && cb.err.call();
                    }
                })
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            }
        }
    }
</script>