<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { Heritage, heritageTimes, heritageTypes, heritages } from '../../assets/heritage/heritage';
import { HeritageProvince, heritageProvinces } from '../../assets/heritage/regions/province';

const selectedHeritages = defineModel<number[]>({ required: true })

const searchName = ref('')
const selectedType = ref('')
const selectedProvince = ref('')
const selectedTime = ref('')

const currentPage = ref(1)
const itemsPerPage = ref(10)

const uniqueTypes = ref<string[]>([])
const uniqueProvinces = ref<HeritageProvince[]>([])
const uniqueTimes = ref<string[]>([])

const fetchUniqueValues = () => {
    uniqueTypes.value = heritageTypes
    uniqueProvinces.value = heritageProvinces
    uniqueTimes.value = heritageTimes
}

watchEffect(() => {
    fetchUniqueValues()
})

const filteredHeritages = computed(() => {
    currentPage.value = 1
    return heritages.filter(heritage => {
        return (
            (searchName.value === '' || heritage.name.includes(searchName.value)) &&
            (selectedType.value === '' || heritage.type === selectedType.value) &&
            (selectedProvince.value === '' || heritage.province === selectedProvince.value) &&
            (selectedTime.value === '' || heritage.time === selectedTime.value)
        )
    })
})

const paginatedHeritages = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredHeritages.value.slice(start, end)
})

const itemsAmount = computed(() => {
    return filteredHeritages.value.length
})

const allowPageUp = computed(() => {
    return currentPage.value < itemsAmount.value / itemsPerPage.value
})

const allowPageDown = computed(() => {
    return currentPage.value > 1
})

const pageUp = () => {
    if (allowPageUp.value) {
        currentPage.value += 1
    }
}

const pageDown = () => {
    if (allowPageDown.value) {
        currentPage.value -= 1
    }
}

const handleSelect = (id: number) => {
    if (selectedHeritages.value.includes(id)) {
        selectedHeritages.value = selectedHeritages.value.filter(selectedId => selectedId !== id)
    } else {
        selectedHeritages.value.push(id)
    }
}

const fromToText = computed(() => {
    if (currentPage.value >= 1 && itemsAmount.value != 0) {
        const start = (currentPage.value - 1) * itemsPerPage.value + 1
        const end = Math.min(start + itemsPerPage.value - 1, itemsAmount.value)
        return `${start} 到 ${end}`
    } else {
        return `0 到 0`
    }
})

const parseProvince = (province: string) => {
    return heritageProvinces.find((target: HeritageProvince) =>
        target.id == province
    )?.name
}

// 默认折叠
const isFolded = ref(true)

const selectedHeritageData = computed(() => {
    return selectedHeritages.value.map((id: number) => {
        return heritages.find((target: Heritage) => {
            return target.id == id
        })
    })
})
</script>

<template>
    <div class="flex items-start flex-col">
        <button @click="isFolded = !isFolded" class="mr-auto mb-1 flex items-center">
            <font-awesome-icon v-if="isFolded" :icon="['fas', 'chevron-left']" class="mr-1 text-slate-500" />
            <font-awesome-icon v-else :icon="['fas', 'chevron-right']" class="mr-1 text-slate-500" />
            相关非遗选择
        </button>
        <div class="flex flex-wrap gap-1 mb-1">
            <div v-for="heritage in selectedHeritageData" class="flex flex-nowrap bg-slate-300 rounded-lg px-1 py-0.5
            hover:bg-slate-400">
                <button @click="handleSelect(heritage?.id as number)"><font-awesome-icon :icon="['fas', 'xmark']"
                        class="mr-0.5 text-slate-500 hover:text-slate-700" /></button>
                <VDropdown>
                    <span class="ml-1 cursor-pointer text-nowrap">{{ heritage?.name }}</span>
                    <template #popper>
                        <div class="flex flex-col px-2 py-1 gap-1">
                            <span>省：<span class="font-bold">{{ parseProvince(heritage?.province as string)
                                    }}</span></span>
                            <span>类型：<span class="font-bold">{{ heritage?.type }}</span></span>
                            <span>批次：<span class="font-bold">{{ heritage?.time }}</span></span>
                            <span>保护单位：<span class="font-bold">{{ heritage?.unit }}</span></span>
                        </div>
                    </template>
                </VDropdown>
            </div>
        </div>
        <Transition name="expand">
            <div v-if="!isFolded">
                <div class="flex gap-2 mb-2 flex-wrap">
                    <select v-model="selectedType" class="focus:outline-none border-2 border-slate-500">
                        <option value="">任意类型</option>
                        <option v-for="type in uniqueTypes" :key="type" :value="type">{{ type }}</option>
                    </select>
                    <select v-model="selectedProvince" class="focus:outline-none border-2 border-slate-500">
                        <option value="">任意省</option>
                        <option v-for="province in uniqueProvinces" :key="province.id" :value="province.id">
                            {{ province.name }}
                        </option>
                    </select>
                    <select v-model="selectedTime" class="focus:outline-none border-2 border-slate-500">
                        <option value="">任意批次</option>
                        <option v-for="time in uniqueTimes" :key="time" :value="time">{{ time }}</option>
                    </select>
                    <input v-model="searchName" placeholder="按名称搜索" name="name"
                        class="flex-grow focus:outline-none border-2 border-slate-500 px-2" />
                </div>
                <div class="min-h-60">
                    <div class="mb-1">共找到：{{ itemsAmount }} 个项目，当前展示第 {{ fromToText }} 个：</div>
                    <!-- 列表项 -->
                    <div v-for="heritage in paginatedHeritages" @click="handleSelect(heritage.id)" :key="heritage.id"
                        class="flex justify-start text-lg odd:bg-slate-100 px-1
                    hover:bg-slate-200"
                        :class="{ 'bg-yellow-100 odd:bg-yellow-100 hover:bg-yellow-200': selectedHeritages.includes(heritage.id) }">
                        <VTooltip>
                            <span class="ml-1 cursor-pointer">
                                <font-awesome-icon v-if="selectedHeritages.includes(heritage.id)"
                                    :icon="['fas', 'check']" />
                                {{ heritage.name }}
                            </span>
                            <template #popper>
                                <div class="flex flex-col px-2 py-1 gap-1">
                                    <span>省：<span class="font-bold">{{ parseProvince(heritage.province) }}</span></span>
                                    <span>类型：<span class="font-bold">{{ heritage.type }}</span></span>
                                    <span>批次：<span class="font-bold">{{ heritage.time }}</span></span>
                                    <span>保护单位：<span class="font-bold">{{ heritage.unit }}</span></span>
                                </div>
                            </template>
                        </VTooltip>
                    </div>
                    <div class="flex justify-center text-sm mt-2 text-slate-700">
                        <button @click="pageDown" :class="{ 'cursor-not-allowed': !allowPageDown }"
                            class="hover:text-slate-800">上一页</button>
                        <input v-model.number="currentPage"
                            class="text-center w-10 mx-5 focus:outline-none border-2 border-slate-300">
                        <button @click="pageUp" :class="{ 'cursor-not-allowed': !allowPageUp }"
                            class="hover:text-slate-800">下一页</button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
    @apply transition-all
}

.expand-enter-from,
.expand-leave-to {
    @apply -translate-x-full opacity-0
}
</style>