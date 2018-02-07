<template>
    <div style="position: relative" v-if="false">
        <a href="javascript:void(0)" @click="showDetails"><Icon :type="show? 'minus-round' : 'plus'"></Icon> SHOW DETAILS</a>
        <div v-show="show" style="z-index: 1000; position: absolute;width: 600px; min-height: 300px;">
            {{incident}}
        </div>
    </div>
</template>
<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'IncidentShowDetails',
        components: {},
        computed: {
            //...VueUtil(this).select(['IncidentShowDetails']).state(),
        },
        props: {
            incident: {
                type: Object,
            }
        },

        data(){
            return {
                show: false,
            }
        },
        mounted(){
        },
        watch: {},
        methods: {
            //...VueUtil(this).select(['IncidentShowDetails']).actions(),
            showDetails(){
                this.show = !this.show;
            }
        }
    }
</script>