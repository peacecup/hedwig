<template>
    <div class="edit-field">
        <form class="form-include" @submit="updateWrapper" onSubmit="return false;">
            <div class="body" v-if="isEdit">
                <div class="input">
                    <slot name="field-item"></slot>
                </div>
                <ButtonGroup>
                    <Button size="small" htmlType="submit" type="success">Save</Button>
                    <Button size="small" @click="cancelWrapper">{{ $t('button.cancel')}}</Button>
                </ButtonGroup>
            </div>
            <div class="value" v-if="!isEdit">
                <slot name="field-value"></slot>
            </div>
            <div v-key="func" >
                <div class="edit-btn" v-if="isEdit == false">
                    <a href="javascript:void(0)" @click="isEdit = true">
                        <Icon type="edit"></Icon>
                    </a>
                </div>
                <div class="copy-btn" v-if="isEdit == false && copy">
                    <a href="javascript:void(0)" @click="copyWrapper">
                        <Icon type="ios-copy-outline"></Icon>
                    </a>
                </div>
                <div class="delete-btn" v-if="isEdit == false && remove">
                    <a href="javascript:void(0)" @click="removeWrapper">
                        <Icon type="close"></Icon>
                    </a>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import _ from 'lodash';

    export default{
        name: 'EditField',
        components: {},
        computed: {},
        props: {
            name: {type: String},
            update: {type: Function},
            remove: {type: Function},
            cancel: {type: Function},
            copy: {type: Function},
            func: {type: [String, Array, Object]},
            edit: {
                type: Boolean,
                default: false
            }
        },

        data(){
            return {
                isEdit: false
            }
        },
        mounted(){
            this.isEdit = this.edit || false;
        },
        watch: {},
        methods: {
            cancelWrapper(){
                if (this.cancel) {
                    this.cancel.call(this);
                }
                this.isEdit = false;
            },
            updateWrapper(){
                this.update.call(this);
                return false;
            },
            removeWrapper(){
                this.$Modal.confirm({
                    title: 'Confirm',
                    content: '<p>Are you sure?</p>',
                    onOk: () => {
                        this.remove.call(this);
                    }
                });
            },
            copyWrapper(){
                this.copy.call(this);
            },
            cb(error){
                if (error) {
                    this.$Message.error(error);
                } else {
                    this.isEdit = false;
                }
            }
        }
    }
</script>