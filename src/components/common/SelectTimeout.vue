<template>
<div>
        <Option :value="600">10 minutes</Option>
        <Option :value="1200">20 minutes</Option>
        <Option :value="1800">30 minutes</Option>
        <Option :value="2400">40 minutes</Option>
        <Option :value="3000">50 minutes</Option>
        <Option :value="3600">60 minutes</Option>
        <Option :value="5400">90 minutes</Option>
        <Option :value="7200">2 hours</Option>
        <Option :value="10800">3 hours</Option>
        <Option :value="14400">4 hours</Option>
        <Option :value="18000">5 hours</Option>
        <Option :value="21600">6 hours</Option>
        <Option :value="43200">12 hours</Option>
        <Option :value="86400">24 hours</Option>
    </div>
</template>

<script>
    export default{
        name: 'SelectTimeout',
    }
</script>