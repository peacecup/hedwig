<template>
    <Modal width="600px" v-model="value" :title="modalTitle" :mask-closable="false">
        <IncidentsEditForm @isLoading="isLoading" ref="form" v-model="value" :service="service" :success="success"></IncidentsEditForm>
        <div slot="footer">
            <Button size="large" :disabled="loading" @click="$emit('input',false)">{{ $t('button.cancel')}}</Button>
            <Button type="primary" size="large" :loading="loading" @click="saveIncidents">{{ $t('button.submit')}}</Button>
        </div>
    </Modal>
</template>

<script>
    import _ from 'lodash';
    import IncidentsEditForm from './IncidentsEditForm.vue';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'IncidentsEdit',
        components: {IncidentsEditForm},
        computed: {
        },
        props: {
            value: {
                default: false,
            },
            service: {
                type: Object,
                default: null
            },
            success: Function,
        },

        data(){
            return {
                loading: false,
                modalTitle: "Create New Incident",
            }
        },

        watch: {
            value(val){
                if(!val){
                    this.$emit('input',val);
                }
            }
        },
        methods: {
            saveIncidents () {
                this.$refs['form'].saveIncidents();
            },
            isLoading(loading){
                this.loading = loading;
            }
        }
    }
</script>