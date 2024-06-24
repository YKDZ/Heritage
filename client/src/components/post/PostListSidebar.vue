<script setup lang="ts">
import { Ref, inject } from 'vue';
import { RouterLink } from 'vue-router';
import { Tag } from '../../api/hook/tagHook';
import { tagsKey } from '../../api/keys/tag';
import { usePostsStore } from '../../api/store/posts';
import { getContentColorForBackground } from '../../utils/color';

const posts = usePostsStore()
const tags = inject<Ref<Tag[]>>(tagsKey)
</script>

<template>
    <div class="sticky top-18 flex flex-col items-start justify-start h-fit">
        <!-- 发布按钮 -->
        <RouterLink to="/posts/create"
            :style="{ 'background-color': posts.watchedTag?.iconColor, 'color': getContentColorForBackground(posts.watchedTag?.iconColor) }"
            class="px-20 py-2 rounded-md text-sm bg-slate-300 text-nowrap">
            发帖
        </RouterLink>
        <!-- 标签选择器 -->
        <div class="mt-6 col-start-5 flex flex-col gap-y-2">
            <VTooltip>
                <button class="text-sm text-slate-500 mb-3" :class="{ 'text-slate-800': !posts.watchedTag?.id }"
                    @click="posts.watchTag(null)">
                    <font-awesome-icon :icon="['far', 'comments']" class="mr-2" />
                    全部帖子
                </button>
                <template #popper>
                    <span class="text-sm text-center">清除标签筛选</span>
                </template>
            </VTooltip>
            <div v-for="tag in tags" :key="tag.id"
                class="w-fit text-slate-500 hover:text-slate-600 cursor-pointer flex items-center"
                @click="posts.watchTag(tag)" :class="{ 'text-slate-800': posts.watchedTag?.id == tag.id }">
                <VTooltip>
                    <font-awesome-icon :icon="tag?.faIcon" class="mr-3 w-4 text-center text-lg"
                        :style="{ 'color': tag.iconColor }" />
                    <span class="text-sm">{{ tag?.title }}</span>
                    <template #popper>
                        <span class="text-sm text-center">{{ tag.description }}</span>
                    </template>
                </VTooltip>
            </div>
        </div>
    </div>
</template>