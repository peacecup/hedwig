<template>
    <div class="select-tabs">
        <Input v-model="selectItem.label"/>
        <Input type="hidden" v-model="selectItem.value"/>
        <div>
            <Tabs>
                <Tab-pane v-for="(tab, index) in tabs" :key="index">
                    <ul>
                        <li v-for="items in tab.items" @click="select(item)">{{item.label}}</li>
                    </ul>
                </Tab-pane>
            </Tabs>
        </div>
    </div>

</template>

<script>
    import _ from 'lodash';

    export default{
        name: 'SelectTabs',
        components: {},
        computed: {
            //...VueUtil(this).select(['SelectTabs']).state(),
        },
        props: {
            tabs:{
                type : Array,
                default: [],
            }
        },

        data(){
            return {
                selectItem:{}
            }
        },
        mounted(){
        },
        watch: {},
        methods: {
            //...VueUtil(this).select(['SelectTabs']).actions(),
        }
    }
</script>