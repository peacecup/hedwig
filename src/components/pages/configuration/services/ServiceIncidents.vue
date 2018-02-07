<template>
    <div class="service-incidents">
        <IncidentsMain :servicePermission="permission" ref="incidentsMain" :service="service"></IncidentsMain>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';
    import IncidentsMain from '../../incidents/IncidentsMain.vue';

    export default{
        name:'ServiceIncidents',
        components: {IncidentsMain},
        props: {
            service:{
                type: Object,
                default:null,
            },
            permission: {
                type: [Boolean],
            }
        },
    }
</script>