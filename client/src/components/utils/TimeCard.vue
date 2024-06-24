<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { convertToCN, formateDateWithDay } from '../../utils/datetime';
import lunisolar from 'lunisolar';

const date = ref<Date>(new Date())

const updateTime = () => {
    date.value = new Date()
}

onMounted(() => {
    const timeTask = setInterval(updateTime, 10000)

    onUnmounted(() => {
        clearInterval(timeTask)
    })
})

const bazi = computed(() => {
    return lunisolar(date.value).format("cY cM cD cH")
})

const lunarDate = computed(() => {
    const lunar = lunisolar(date.value).lunar
    const month = lunar.getMonthName()
    const day = lunar.getDayName()
    return lunisolar(date.value).format(`cZ年 农历${month}${day}日 lH时`)
})

const jieqi = computed(() => {
    return lunisolar(date.value).format("T")
})
</script>

<template>
    <div class="px-3 py-1 w-fit h-fit bg-slate-100 shadow-sm flex flex-col">
        <span>{{ formateDateWithDay(date) }}</span>
        <span>{{ bazi }}</span>
        <span>{{ lunarDate }}</span>
        <span>{{ jieqi }}</span>
    </div>
</template>