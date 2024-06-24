<script setup lang="ts">
import { onMounted, ref, provide } from 'vue';
import { ViewHistoriesData, ViewHistory, getViewHistories } from '../../api/hook/userHook';
import { ServerError } from '../../utils/ServerError';
import { showErrorPopup } from '../utils/Popup.vue';
import { formatDateWithoutDetails } from '../../utils/datetime';
import { computed } from '@vue/reactivity';
import ProfileHistoryBox from './ProfileHistoryBox.vue';
import { tagsKey } from '../../api/keys/tag';
import { badgesKey } from '../../api/keys/badge';
import { Tag, getTags } from '../../api/hook/tagHook';
import { Badge, getBadges } from '../../api/hook/badgeHook';

const historiesData = ref<ViewHistoriesData>()
const tags = ref<Tag[]>([])
const badges = ref<Badge[]>([])

onMounted(async () => {
    await getTags()
        .then((fetched: Tag[]) => {
            tags.value = fetched
        })
        .catch((error: ServerError) => {
            showErrorPopup(error, 2000)
        })
    await getBadges()
        .then((fetched: Badge[]) => {
            badges.value = fetched
        })
        .catch((error: ServerError) => {
            showErrorPopup(error, 2000)
        })
})

provide(tagsKey, tags)
provide(badgesKey, badges)

onMounted(async () => {
    await getViewHistories()
        .then((fetched: ViewHistoriesData) => {
            historiesData.value = fetched
        })
        .catch((error: ServerError) => {
            showErrorPopup(error, 2000)
        })
})

const dates = computed(() => {
    const result = new Map<String, ViewHistory[]>()
    historiesData.value?.histories.forEach((history: ViewHistory) => {
        const dateKey = formatDateWithoutDetails(history.time)
        if (!result.has(dateKey)) {
            result.set(dateKey, [])
        }
        result.get(dateKey)?.push(history)
    })
    return result
})
</script>

<template>
    <div class="flex flex-col w-full">
        <div v-for="date in dates.keys()" :key="date.toString()">
            <span class="block border-b-2 border-dashed border-black border-opacity-20 pb-2">{{ date }}</span>
            <ProfileHistoryBox v-for="history in historiesData?.histories" :history="history" :key="history.id" />
        </div>
        <div ref="loadMorePostTrigger"></div>
    </div>
</template>