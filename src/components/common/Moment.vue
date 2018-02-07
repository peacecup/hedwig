<template>
    <span>{{result}}</span>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    export default{
        name: 'Moment',
        props: [
            'format',
            'date'
        ],

        data(){
            return {
                result: ''
            };
        },
        mounted(){
            this.render();
        },

        watch: {
            'date': 'render', 'format': 'render'
        },
        methods: {
            render(){
                this.result = moment(this.date).format(this.format);
            },
        }
    }
</script>