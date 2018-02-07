/**
 * Created by binwang on 17/9/4.
 */
import _ from 'lodash';
import moment from 'moment';

// 合并图层数据  layer1 级别较低 ,layer2 级别较高
const mergeLayer = (layer1, layer2) => {
    if (layer1.length === 0)
        return layer2;

    _.forEach(layer2, l2 => { //渐进合并数据
        layer1 = mergeLayerStep(layer1, l2);
    })
    return _.chain(layer1).concat(layer2).sortBy(l => l.begin).value();
}

const mergeLayerStep = (layer1, layerSingle) => {
    let begin = layerSingle.begin;
    let end = layerSingle.end;
    let inserts = [];
    _.forEach(layer1, l1 => {
        let _b;
        let _e;
        if (l1.end <= begin || l1.begin >= end) {
            _b = l1.begin;
            _e = l1.end;
            inserts.push({
                ...l1,
                begin: _b,
                end: _e,
            });
        } else if (l1.begin <= begin) {
            inserts.push({
                ...l1,
                begin: l1.begin,
                end: begin,
            });
            if (l1.end > end) {
                inserts.push({
                    ...l1,
                    begin: end,
                    end: l1.end,
                });
            }

        } else if (l1.begin > begin && l1.end > end) {
            inserts.push({
                ...l1,
                begin: end,
                end: l1.end,
            });
        }
    });
    return inserts;
}

//  合并相邻事件
const mergeEvent = (events) => {
    let result = [];
    if (events && _.isArray(events))
        _.forEach(events, l => {
            if (result.length > 0 && result[result.length - 1].userId === l.userId && result[result.length - 1].end === l.begin) {
                result[result.length - 1].end = l.end;
            } else {
                result.push(l);
            }
        })
    return result;
}

const getStepDays = (scope, step) => {
    if (scope === '4d')
        step *= 4;
    if (scope === '1w')
        step *= 7;
    if (scope === '2w')
        step *= 14;
    if (scope === '1m')
        step *= 31;
    return step;
}

const eventsToLayers = (events, beginTime = moment(), startTime = moment(), scope) => {
    const dateFormat = 'YYYY-MM-DD HH:mm';
    let timeline = [];
    let layers = [];
    let lastTime = moment(startTime).add(getStepDays(scope, 1), 'd').format(dateFormat);
    _.forEach(events, (event, i) => {
        let begin = _.cloneDeep(event.handoffTime);
        //合并 loops
        let _loops = [];
        _.forEach(event.loops, l => {
            if (_loops.length > 0 && _loops[_loops.length - 1].id === l.id) {
                _loops[_loops.length - 1].step = _loops[_loops.length - 1].step + 1;
            } else {
                _loops.push({...l, step: 1});
            }
        })
        event.loops = _loops;
        if (event.loops.length > 0) {
            let layer = [];
            while (true) {
                let _begin = begin.format(dateFormat);
                if (_begin >= lastTime) {
                    break;
                }
                let events = [];
                _.forEach(event.loops, (l) => {
                    _begin = begin.format(dateFormat);
                    begin.add(event.step * l.step, event.stepUnit);
                    if (_begin > _.cloneDeep(beginTime).add(-1, 'w').format(dateFormat)) {
                        let _end = _.cloneDeep(begin).format(dateFormat);
                        events.push({
                            ...l,
                            userId: l.id,
                            id: null,
                            top: (i + 1) * 40,
                            effectAt: event.effectAt,
                            begin: _begin,
                            end: _end,
                        });
                    }
                })
                timeline = _.concat(timeline, events);
                layer = _.concat(layer, events);
            }
            layers.push(layer);
        }
    });

    return {layers, timeline};
}

const getSecondByUnit = (unit) => {
    const one_hour_second = 3600;
    switch (unit) {
        case 'h':
            return one_hour_second;
        case 'd':
            return one_hour_second * 24;
        case 'w':
            return one_hour_second * 24 * 7;
        default:
            return null;
    }
}

const getWeek = () =>{
   return [{
        label: 'Sun',
        value: 7
    }, {
        label: 'Mon',
        value: 1
    }, {
        label: 'Tur',
        value: 2
    }, {
        label: 'Wed',
        value: 3
    }, {
        label: 'Thu',
        value: 4
    }, {
        label: 'Fri',
        value: 5
    }, {
        label: 'Sat',
        value: 6
    },];
}

const scheduleToEvents = (schedule) => {
    let events = _.map(schedule.layers, l => {
        let step = 1;
        let stepUnit = 'w';
        if (l.rotationType === 'weekly') {
            step = 1;
            stepUnit = 'w';
        } else if (l.rotationType === 'daily') {
            step = 1;
            stepUnit = 'd';
        } else if (l.rotationType === 'custom') {
            step = l.shiftLength;
            stepUnit = l.shiftUnit;
        }

        let handoffTime;
        if (_.isString(l.handoffDay) || l.handoffDay instanceof Date) {
            handoffTime = moment(moment(l.handoffDay).format('YYYY-M-D') + " " + moment(l.handoffTime).format("H:m"));
        } else {
            handoffTime = moment(l.handoffDay.format('YYYY-M-D') + " " + moment(l.handoffTime).format("H:m"));
        }
        return {
            name: l.name,
            title: l.name,
            effectAt: l.effectAt,
            handoffTime: handoffTime,
            stepUnit: stepUnit,
            step: step,
            loops: _.chain(l.selectUsers).filter(u => !_.isUndefined(u.name)).map(u => {
                return {...u, title: u.name}
            }).value(),
        }
    })
    return events;
}

const momentToString =(time) =>{
    return time.format("YYYY-MM-DDTHH:mm:ss.sss")+"Z";
}

const momentToUTC =(time) =>{
    return time.format("YYYY-MM-DD HH:mm:ss.sss");
}

export  default {
    mergeLayer,
    mergeEvent,
    getStepDays,
    getSecondByUnit,
    scheduleToEvents,
    eventsToLayers,
    getWeek,
    momentToString,
    momentToUTC
};
