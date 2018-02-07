<template>
    <div>
        <Form ref="changePwdForm">
            <Form-item label="Current password:">
                <Input type="password"/>
            </Form-item>
            <Form-item label="New password:">
                <Input type="password"/>
            </Form-item>
            <Form-item label="Confirm password:">
                <Input type="password"/>
            </Form-item>
            <Form-item >
                <Button type="primary">Save</Button>
                <Button>{{ $t('button.cancel')}}</Button>
            </Form-item>
        </Form>
    </div>
</template>

<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';

    export default{
        name: 'ChangePassword',
        components: {},
        computed: {
            //...VueUtil(this).select(['ChangePassword']).state(),
        },
        props: {
            user:{}
        },

        data(){
            return {}
        },
        mounted(){
        },
        watch: {},
        methods: {
            //...VueUtil(this).select(['ChangePassword']).actions(),
        }
    }
</script>