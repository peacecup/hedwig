<template>
    <div>
        <Option :key="time.value" v-for="time in times" :value="time.value">{{time.label}}</Option>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'SelectTimeout',
        data(){
            let times = [];
            for (let i = 0, j = 0; i < 24; i++) {
                times.push({
                    value: 3600 * 0.5 * j++,
                    label: `${i}:00`,
                });
                times.push({
                    value: 3600 * 0.5 * j++,
                    label: `${i}:30`,
                });
            }
            return {
                times
            };
        }
    }
</script>