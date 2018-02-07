<template>
    <Row>
        <Col span="24">
        <h1>{{title}}</h1>
        </Col>
        <Col span="24">
        <Button icon="plus" type="success">{{addBtn.title}}</Button>
        </Col>
        <Col span="24">
        <Table @on-sort-change="sortChange" size="small" :columns="columns"
               :data="ServiceIntegrations.list.data.list"></Table>
        </Col>
        <Col span="24">
        <div style="float: right;">
            <Page :total="ServiceIntegrations.list.data.total" :current="ServiceIntegrations.list.data.offset"
                  size="small" @on-change="changePage" @on-page-size-change="changePageSizer" show-total
                  show-sizer></Page>
        </div>
        </Col>
    </Row>
</template>
<script>
    import _ from 'lodash';
    import {VueUtil, FormUtil} from '@util';
    import DropMenuDecorator from '@common/DropMenuDecorator.vue';

    export default {
        name: 'ServiceExtensions',
        components: {},
        computed: {
            ...VueUtil(this).select(['ServiceExtensions']).state(),

        },
        props: {},

        data() {
            let fields = [{
                label: '',
                id: 'icon'

            }, {
                label: 'Extension Type',
                id: 'extensionType'

            }, {
                label: 'Name',
                id: 'name'

            }, {
                label: 'Details',
                id: 'details',
            },];


            const formUtil = FormUtil(this);
            formUtil.fields(fields);
            let query = formUtil.defaultQuery();
            const rowMenuList = [

                {title: "edit", icon: "edit", type: 'edit'},
                {title: "remove", icon: "trash-a", type: 'remove'},
            ]
            return {
                query,
                loading: false,
                title: 'Extensions',
                addBtn: {title: "New Extensions"},
                columns: [
                    ...formUtil.columns(),
                    {
                        key: 'id',
                        render: (h, params) => {
                            return h(DropMenuDecorator, {
                                props: {
                                    id: params.row.id,
                                    select: this.operate,
                                    title: 'Operate',
                                    list: rowMenuList,
                                }
                            });
                        }
                    }
                ]

            }
        },
        mounted(){
            this.changePage(1);
            this.currentTab = this.$route.name || "ServiceExtensions";
            this.changeTabs(this.currentTab);
        },
        watch: {},
        methods: {
            ...VueUtil(this).select(['ServiceExtensions']).actions(),

            changePage(page)
            {
                page ? this.query.offset = page : null;
                VueUtil(this).select('ServiceExtensions').list(this.query);
            }
            ,
            changePageSizer(pageSize)
            {
                this.query.limit = pageSize;
                VueUtil(this).select('Services').list(this.query);
            }
            ,
            sortChange({key, order})
            {
                this.query = {...this.query, sortField: key, sortOrder: order};
                this.changePage();
            }
        }
    }
</script>