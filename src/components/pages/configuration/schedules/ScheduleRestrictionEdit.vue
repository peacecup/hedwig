<template>
    <div>

        <Form>
            <Radio-group v-model="tempInfo.restrictType">
                <div class="top-bottom-10">
                    <Radio label="daily_restriction">Restrict on-call duty to specific times-of-the-day:</Radio>
                    <div class="top-bottom-5"
                         v-for="(restrict,index) in tempInfo.restrictions.daily_restrictions">
                        <span v-if="index !== 0">and </span>from



                        <TimePicker :steps="[1, 30]" :clearable="false" :editable="true"
                                    v-model="restrict.from"
                                    :disabled="tempInfo.restrictType !== 'daily_restriction'"
                                    format="HH:mm" placeholder="选择时间" style="width: 112px"></TimePicker>
                        to



                        <TimePicker :steps="[1, 30]" :clearable="false" :editable="true"
                                    v-model="restrict.to"
                                    :disabled="tempInfo.restrictType !== 'daily_restriction'"
                                    format="HH:mm" placeholder="选择时间" style="width: 112px"></TimePicker>

                        <Button
                                :disabled="tempInfo.restrictType !== 'daily_restriction'"
                                v-if="index === tempInfo.restrictions.daily_restrictions.length -1"
                                size="small" icon="plus" type="success"
                                @click="addRestrict('daily_restriction')"></Button>
                        <Button v-if="index !== 0"
                                :disabled="tempInfo.restrictType !== 'daily_restriction'"
                                size="small" icon="close"
                                @click="removeRestrict('daily_restriction',restrict)"></Button>
                    </div>
                </div>
                <div class="top-bottom-10">
                    <Radio label="weekly_restriction">Restrict on-call duty to specific times-of-the-week:</Radio>
                    <div class="top-bottom-5"
                         v-for="(restrict,index) in tempInfo.restrictions.weekly_restrictions">
                        <span v-if="index !== 0">and </span>from
                            <Select
                            :disabled="tempInfo.restrictType !== 'weekly_restriction'"
                            v-model="restrict.start_day_of_week" style="width:70px">
                        <Option :value="weekday.value" :key="weekday.value" v-for="weekday in weeks">{{weekday.label}}
                        </Option>
                    </Select>
                        <TimePicker :steps="[1, 30]"  :clearable="false" :editable="false"
                                    v-model="restrict.from"
                                    :disabled="tempInfo.restrictType !== 'weekly_restriction'"
                                    format="HH:mm" placeholder="选择时间" style="width: 112px"></TimePicker>
                        to
                        <Select
                            :disabled="tempInfo.restrictType !== 'weekly_restriction'"
                            v-model="restrict.end_day_of_week" style="width:70px">
                        <Option :value="weekday.value" :key="weekday.value" v-for="weekday in weeks">{{weekday.label}}
                        </Option>
                    </Select>
                        <TimePicker :steps="[1, 30]" :clearable="false" :editable="false"
                                    v-model="restrict.to"
                                    :disabled="tempInfo.restrictType !== 'weekly_restriction'"
                                    format="HH:mm" placeholder="选择时间" style="width: 112px"></TimePicker>
                        <Button
                                :disabled="tempInfo.restrictType !== 'weekly_restriction'"
                                v-if="index === tempInfo.restrictions.weekly_restrictions.length -1"
                                size="small" icon="plus" type="success"
                                @click="addRestrict('weekly_restriction')"></Button>
                        <Button v-if="index !== 0"
                                :disabled="tempInfo.restrictType !== 'weekly_restriction'"
                                size="small" icon="close"
                                @click="removeRestrict('weekly_restriction',restrict)"></Button>
                    </div>
                </div>
            </Radio-group>
        </Form>
    </div>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import {VueUtil, FormUtil, ScheduleUtil} from '@util';
    export default{
        name: 'ScheduleRestrictionEdit',
        components: {},
        computed: {},
        props: {
            modal: {
                type: Boolean,
                default: false,
            },
            value: {
                type: Object,
                default: {
                    restrictCall: false,
                    restrictType: 'daily_restriction',
                    restrictions: null,
                },
            }
        },

        data(){
            return {
                model: true,
                weeks: this.getWeeks(),
                tempInfo: {
                    restrictCall: true,
                    restrictType: 'daily_restriction',
                    restrictions: this.getDefaultRestriction(),
                },
            }
        },
        mounted(){
            this.tempInfo = {
                restrictCall: true,
                restrictType: 'daily_restriction',
                restrictions: this.getDefaultRestriction(),
            }
        },
        watch: {
            'modal': 'listenModal',
        },
        mounted(){
            this.setRestrictInfo(this.value);
        },
        methods: {

            getDefaultRestriction(){
                return {
                    daily_restrictions: [
                        {type: 'daily_restriction', disabled: false, from: "00:00", to: "00:00"},
                    ],
                    weekly_restrictions: [
                        {
                            type: 'weekly_restriction',
                            disabled: false,
                            start_day_of_week: 7,
                            end_day_of_week: 7,
                            from: "00:00",
                            to: "00:00"
                        },
                    ],
                };
            },

            getWeeks(){
                return ScheduleUtil.getWeek();
            },
            setRestrictInfo(restrictInfo){
                let info = _.cloneDeep(restrictInfo);
                const defaultRestriction = this.getDefaultRestriction();
                if (!info.restrictions.weekly_restrictions || info.restrictions.weekly_restrictions.length === 0) {
                    info.restrictions.weekly_restrictions = [...defaultRestriction.weekly_restrictions];
                }
                if (!info.restrictions.daily_restrictions || info.restrictions.daily_restrictions.length === 0) {
                    info.restrictions.daily_restrictions = [...defaultRestriction.daily_restrictions];
                }
                if(!info.restrictType)
                    info.restrictType = 'daily_restriction';
                this.tempInfo = info;
            },
            listenModal(modal){
                if(modal){
                    this.setRestrictInfo(this.value);
                }
            },

            applyRestriction(){
                this.tempInfo.restrictions[`${this.tempInfo.restrictType}s`] = _.chain(this.tempInfo.restrictions[`${this.tempInfo.restrictType}s`]).map(info => {
                    return info;
                }).filter(info => info !== null).value();
                this.$emit('input', this.tempInfo);
            },
            addRestrict(type){
                this.tempInfo.restrictions[type + 's'].push({
                    type,
                    _id: VueUtil(this).guid(),
                    ... (this.getDefaultRestriction()[type + 's'][0])
                });
            },
            removeRestrict(type, restrict){
                this.tempInfo.restrictions[type + 's'] = _.filter(this.tempInfo.restrictions[type + 's'], re => !_.isEqual(re, restrict));
            },
        }
    }
</script>