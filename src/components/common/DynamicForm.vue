<template>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="labelWidth || 80"
          onSubmit="return false">
        <Row>
            <i-col v-for="field in editFields"
                   :style="{display:field.type === 'hidden'?'none':'block'}" class
                   :key="field.id"
                   :span="field.span || 12">
                <div v-if="field.primaryTitle" style="margin-bottom: 10px;">
                    <h2>{{field.primaryTitle}}</h2>
                    <p v-if="field.secondaryTitle">{{field.secondaryTitle}}</p>
                    <div class="divider"></div>
                </div>

                <Form-item v-if="field.type !== 'slot'" :label="I18n(field.label)" :prop="field.id">
                    <input type="hidden" v-if="field.type === 'hidden'" v-model="formValidate[field.id]"/>
                    <Input v-if="field.type === 'input'"
                           v-model="formValidate[field.id]"
                           :style="field.style"
                           :disabled="field.disabled"
                           :maxlength="field.maxlength || 100"
                           :placeholder="field.placeholder || `please input ${field.label}`"></Input>
                    <Select v-else-if="field.type ==='select'"
                            v-model="formValidate[field.id]"
                            @on-change="field.onchange"
                            :disabled="field.disabled"
                            :style="field.style"
                            :ref="'select_'+field.id"
                            :initialValue="field.initialValue || (field.multiple?[]:null)"
                            :placeholder="field.placeholder || `please input ${field.label}`"
                            :clearable="field.clearable || true"
                            :filterable="field.filterable || false"
                            :multiple="field.multiple || false"
                            :remote="field.remote || false"
                            :remote-method="field.remoteMethod || null"
                    >
                        <Option v-if="dicts && dicts[field.options || field.id]"
                                v-for="option in dicts[field.options  || field.id]"
                                :key="option.id"
                                :value="option.value"
                                :disabled="option.disabled">{{option.label}}
                        </Option>
                    </Select>
                    <Select v-else-if="field.type ==='select-group'"
                            v-model="formValidate[field.id]"
                            :style="field.style"
                            :disabled="field.disabled"
                            :ref="'select_'+field.id"
                            :initialValue="field.initialValue || (field.multiple?[]:null)"
                            :placeholder="field.placeholder || `please input ${field.label}`"
                            :clearable="field.clearable || true"
                            :filterable="field.filterable || false"
                            :multiple="field.multiple || false"
                            :remote="field.remote || false"
                            :remote-method="field.remoteMethod || null"
                    >
                        <Option-group v-if="dicts && dicts[field.options || field.id]"
                                      v-for="group in dicts[field.options || field.id]" :label="group.name" :key="group.name">
                                <div v-if="!group.list || group.list.length === 0" class="text-align-center top-bottom-10">No Data</div>
                                <Option v-for="option in group.list"
                                        :key="option.value"
                                        :value="option.value">{{option.label}}
                                </Option>
                        </Option-group>
                    </Select>
                    <Select v-else-if="field.type ==='select-group-tabs'"
                            v-model="formValidate[field.id]"
                            :style="field.style"
                            :disabled="field.disabled"
                            :ref="'select_'+field.id"
                            :initialValue="field.initialValue || (field.multiple?[]:null)"
                            :placeholder="field.placeholder || `please input ${field.label}`"
                            :clearable="field.clearable || true"
                            :filterable="field.filterable || false"
                            :multiple="field.multiple || false"
                            :remote="field.remote || false"
                            :remote-method="field.remoteMethod || null"
                    >
                        <Tabs value="tab_0" :animated="false">
                            <Tab-pane v-for="(group,index ) in dicts[field.options || field.id]" :label="group.name" :name="`tab_${index}`" :key="group.name">
                                    <div style="overflow-y:auto;max-height: 330px;min-height:50px;">
                                        <Option v-for="option in group.list"
                                                :key="group.name+option.value"
                                                :value="option.value">{{option.label}}
                                            </Option>
                                    </div>
                            </Tab-pane>
                        </Tabs>
                    </Select>
                    <Select v-else-if="field.type ==='timezone'"
                            v-model="formValidate[field.id]"
                            :style="field.style"
                            :ref="'select_'+field.id"
                            :disabled="field.disabled"
                            :initialValue="field.initialValue || (field.multiple?[]:null)"
                            :placeholder="field.placeholder || `please input ${field.label}`"
                            :clearable="field.clearable || true"
                            :filterable="field.filterable || false"
                            :multiple="field.multiple || false"
                            :remote="field.remote || false"
                            :remote-method="field.remoteMethod || null"
                    >
                        <TimeZoneSelect></TimeZoneSelect>
                    </Select>
                    <Radio-group v-else-if="field.type ==='radio'"
                                 v-model="formValidate[field.id]" :disabled="field.disabled"
                                 :style="field.style">
                        <div v-if="dicts && dicts[field.options || field.id]"
                             v-for="option in dicts[field.options || field.id]"
                             :key="option.value">
                            <Radio :label="option.value">{{option.label}}</Radio>
                            <p style="margin-left: 20px;" v-if="option.description">{{option.description}}</p>
                        </div>
                    </Radio-group>
                    <Checkbox-group v-else-if="field.type ==='checkbox'"
                                    v-model="formValidate[field.id]" :disabled="field.disabled"
                                    :style="field.style">
                        <div v-if="dicts && dicts[field.options || field.id]"
                             v-for="option in dicts[field.options] || field.id"
                             :key="option.value"
                        >
                            <Checkbox :label="option.value">{{option.label}}</Checkbox>
                            <p style="margin-left: 20px;" v-if="option.description">{{option.description}}</p>
                        </div>
                    </Checkbox-group>
                    <Date-picker :disabled="field.disabled" v-else-if="field.type ==='date'" type="date"
                                 :format="field.format"
                                 :placeholder="field.placeholder || `please select ${field.label}`"
                                 v-model="formValidate[field.id]"></Date-picker>
                    <Date-picker :disabled="field.disabled" v-else-if="field.type ==='datetime'" type="datetime"
                                 :format="field.format"
                                 :placeholder="field.placeholder || `please select ${field.label}`"
                                 v-model="formValidate[field.id]"></Date-picker>
                    <Time-picker :disabled="field.disabled" v-else-if="field.type ==='time'" type="time"
                                 :placeholder="field.placeholder || `please select ${field.label}`"
                                 v-model="formValidate[field.id]"></Time-picker>
                    <Input :style="field.style" v-else-if="field.type ==='textarea'" v-model="formValidate[field.id]"
                           type="textarea"
                           :autosize="{minRows: 2,maxRows: 5}"
                           :disabled="field.disabled"
                           :maxlength="field.maxlength || 1000"
                           :placeholder="field.placeholder || `please input ${field.label}`"></Input>
                    <ColorPicker :recommend="true" v-else-if="field.type ==='color'" v-model="formValidate[field.id]"/>

                </Form-item>
                <template if="field.type === 'slot'">
                    <slot :name="field.id"></slot>
                </template>
            </i-col>
        </Row>
        <Form-item v-if="button.enable">
            <Button :loading="loading" htmlType="submit" type="primary" @click="submitWrapper">{{ $t('button.submit')}}</Button>
            <Button :disabled="loading" type="error" @click="handleReset('formValidate')" style="margin-left: 8px">{{ $t('button.reset')}}</Button>
            <Button :disabled="loading" type="ghost" @click="button.cancel" style="margin-left: 8px">{{ $t('button.cancel')}}</Button>
        </Form-item>
        <Button v-else-if :loading="loading" htmlType="submit" type="primary" style="display: none;"
                @click="submitWrapper">{{$t('button.submit')}}</Button>
    </Form>
</template>
<script>
    import {VueUtil} from '@util';
    export default {
        name: 'DynamicForm',
        props: {
            ruleValidate: {
                type: Object
            },
            formValidate: {
                type: Object
            },
            editFields: {
                type: Array
            },
            labelWidth: {
                type: [String, Number]
            },
            button: {
                type: Object
            },
            dicts: {
                type:  [Object, Array]
            },
            loading: {
                type: Boolean,
            },
            submit: {
                type: Function
            }
        },
        data () {
            return {}
        },
        mounted(){
            this.handleReset('formValidate');
        },
        methods: {
            I18n(key){
                return VueUtil(this).I18n(key);
            },
            submitWrapper(){
                if (this.submit) {
                    this.submit.call()
                } else if (this.button.submit) {
                    this.button.submit();
                }
            },
            validate(cb){
                this.$refs['formValidate'].validate((valid,errors) => {
                    if (valid) {
                        !!cb.ok && cb.ok.call(this, this.formValidate);
                    } else {
                        this.$Message.error(this.$t('valid.formError'));
                        !!cb.err && cb.err.call();
                    }
                })
            },
            handleReset (name) {
                this.$refs[name].resetFields();
                if (this.button.reset) {
                    this.button.reset();
                }
            },
            resetForm(){
                this.handleReset('formValidate');
            }
        }
    }
</script>
