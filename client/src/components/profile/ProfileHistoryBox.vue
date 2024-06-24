<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ViewHistory } from '../../api/hook/userHook';
import { Ref, inject } from 'vue';
import { Tag } from '../../api/hook/tagHook';
import { Badge } from '../../api/hook/badgeHook';
import { tagsKey } from '../../api/keys/tag';
import { badgesKey } from '../../api/keys/badge';
import { getContentColorForBackground } from '../../utils/color';
import { formatDate, formatDateWithoutDetails } from '../../utils/datetime';

const props = defineProps<{
    history: ViewHistory
}>()
const tags = inject<Ref<Tag[]>>(tagsKey) as Ref<Tag[]>
const badges = inject<Ref<Badge[]>>(badgesKey) as Ref<Badge[]>

const tagFromIds = (ids: number[]): Tag[] => {
    const result = ids.map((id) => tags.value.find((target) => target.id == id))
    return result.filter((tag): tag is Tag => tag !== undefined)
}

const badgesFromIds = (ids: number[]): Badge[] => {
    const result = ids.map((id) => badges.value.find((target) => target.id == id))
    return result.filter((badge): badge is Badge => badge !== undefined)
}
</script>

<template>
    <RouterLink v-if="history.post.id" :to="`/posts/${history.post.id}`" :key="history.id"
        class="w-full h-14 max-h-14 min-h-14 py-2 px-2 flex flex-col items-start hover:bg-slate-100 transition-colors">
        <!-- 第一行 -->
        <div class="w-full h-1/2 flex items-center justify-between">
            <div class="flex items-center">
                <!-- 徽章 -->
                <div v-if="history.post.badges && history.post.badges.length > 0"
                    class="relative w-fit flex items-center"
                    :style="{ 'margin-right': history.post.badges.length * 22 + 'px' }">
                    <div v-for="badge in badgesFromIds(history.post.badges)" :key="badge.id" class="absolute">
                        <VTooltip>
                            <font-awesome-icon :icon="badge.faIcon" class="w-3 h-3 rounded-full mr-0.5 p-1 shadow-md"
                                :style="{ 'color': getContentColorForBackground(badge.iconColor), 'background-color': badge.iconColor }" />
                            <template #popper>
                                <span class="text-sm">{{ badge.name }}</span>
                            </template>
                        </VTooltip>
                    </div>
                </div>
                <!-- 标题 -->
                <span class="text-lg font-bold text-slate-800">{{ history.post.title }}</span>
            </div>
            <div class="flex items-center">
                <!-- 标签 -->
                <div v-if="history.post.tags && history.post.tags.length > 0" class="justify-self-end mr-2 flex">
                    <div v-for="tag in tagFromIds(history.post.tags)"
                        :style="{ 'background-color': tag?.iconColor, 'color': getContentColorForBackground(tag.iconColor as string) }"
                        class="text-xs px-1.5 py-0.5 h-fit first:rounded-l-md last:rounded-r-md" :key="tag.id">
                        <font-awesome-icon :icon="tag.faIcon" class="mr-0.5 w-3 min-w-3 text-center" />
                        {{ tag?.title }}
                    </div>
                </div>
            </div>
        </div>
        <!-- 第二行 -->
        <div class="w-full h-1/2 flex items-center">
            <!-- 浏览日期 -->
            <div class="text-xs text-slate-400">
                <span class="ml-1">浏览于</span>
                {{ formatDate(history.time) }}
            </div>
        </div>
    </RouterLink>
    <div v-else
        class="w-full h-14 max-h-14 min-h-14 py-2 px-2 flex flex-col items-start hover:bg-slate-100 transition-colors">
        <span class="text-lg font-bold text-slate-800">原帖已被删除</span>
        <!-- 第二行 -->
        <div class="w-full h-1/2 flex items-center">
            <!-- 浏览日期 -->
            <div class="text-xs text-slate-400">
                <span class="ml-1">浏览于</span>
                {{ formatDate(history.time) }}
            </div>
        </div>
    </div>
</template>