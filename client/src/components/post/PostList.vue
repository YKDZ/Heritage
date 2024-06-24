<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import { Tag, getTags } from '../../api/hook/tagHook';
import { tagsKey } from '../../api/keys/tag';
import { usePostsStore } from '../../api/store/posts';
import { ServerError } from '../../utils/ServerError';
import { getContentColorForBackground } from '../../utils/color';
import { formatDateDistanceToNow, formatDateWithoutDetails } from '../../utils/datetime';
import { showErrorPopup } from '../utils/Popup.vue';
import PostListSidebar from './PostListSidebar.vue';
import HeritageFilter from '../utils/HeritageFilter.vue';
import { Badge, getBadges } from '../../api/hook/badgeHook';

const posts = usePostsStore()
const tags = ref<Tag[]>([])
const badges = ref<Badge[]>([])
const loadMorePostTrigger = ref<HTMLDivElement>()

provide(tagsKey, tags)

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
    await posts.load()
})

onUnmounted(() => {
    posts.unload()
})

watch(() => posts.watchedTag,
    async () => {
        await posts.reload()
    }
)

const tagFromIds = (ids: number[]): Tag[] => {
    const result = ids.map((id) => tags.value.find((target) => target.id == id))
    return result.filter((tag): tag is Tag => tag !== undefined)
}

const badgesFromIds = (ids: number[]): Badge[] => {
    const result = ids.map((id) => badges.value.find((target) => target.id == id))
    return result.filter((badge): badge is Badge => badge !== undefined)
}

onMounted(() => {
    if (loadMorePostTrigger.value) {
        observer.observe(loadMorePostTrigger.value)
    }
})

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && posts.isLoaded) {
        posts.loadMorePosts()
    }
})

onBeforeUnmount(() => {
    if (loadMorePostTrigger.value) {
        observer.unobserve(loadMorePostTrigger.value)
    }
})
</script>

<template>
    <div class="mt-4 grid grid-cols-6 gap-x-10 gap-y-2">
        <!-- 列表 -->
        <div class="row-start-2 col-start-2 col-span-3 flex flex-col">
            <!-- 筛选器 -->
            <div class="flex items-center justify-start gap-2 mb-2">
                <div>
                    <HeritageFilter />
                </div>
            </div>
            <div v-if="posts.filteredLoadedPosts?.length == 0"
                class="w-full py-1 px-2 flex flex-col items-center justify-center">
                <span class="text-lg">没有找到相关帖子</span>
                <span class="text-slate-500">尝试减少筛选项或切换标签</span>
            </div>
            <!-- 帖子 -->
            <RouterLink v-for="post in posts.filteredLoadedPosts" :to="`/posts/${post.id}`" :key="post.id"
                class="w-full h-14 max-h-14 min-h-14 py-2 px-2 flex flex-col items-start hover:bg-slate-100 transition-colors">
                <!-- 第一行 -->
                <div class="w-full h-1/2 flex items-center justify-between">
                    <div class="flex items-center">
                        <!-- 徽章 -->
                        <div v-if="post.badges && post.badges.length > 0" class="relative w-fit flex items-center" :style="{ 'margin-right': post.badges.length * 22 + 'px' }">
                            <div v-for="badge in badgesFromIds(post.badges)" :key="badge.id" class="absolute">
                                <VTooltip>
                                    <font-awesome-icon :icon="badge.faIcon"
                                        class="w-3 h-3 rounded-full mr-0.5 p-1 shadow-md"
                                        :style="{ 'color': getContentColorForBackground(badge.iconColor), 'background-color': badge.iconColor }" />
                                    <template #popper>
                                        <span class="text-sm">{{ badge.name }}</span>
                                    </template>
                                </VTooltip>
                            </div>
                        </div>
                        <!-- 标题 -->
                        <span class="text-lg font-bold text-slate-800">{{ post.title }}</span>
                    </div>
                    <div class="flex items-center">
                        <!-- 标签 -->
                        <div v-if="post.tags && post.tags.length > 0" class="justify-self-end mr-2 flex">
                            <div v-for="tag in tagFromIds(post.tags)"
                                :style="{ 'background-color': tag?.iconColor, 'color': getContentColorForBackground(tag.iconColor as string) }"
                                class="text-xs px-1.5 py-0.5 h-fit first:rounded-l-md last:rounded-r-md" :key="tag.id">
                                <font-awesome-icon :icon="tag.faIcon" class="mr-0.5 w-3 min-w-3 text-center" />
                                {{ tag?.title }}
                            </div>
                        </div>
                        <!-- 回复数量 -->
                        <div class="justify-self-end flex items-center">
                            <font-awesome-icon v-if="posts.commentAmountOf(post.id as number) as number > 0"
                                :icon="['fas', 'comment']" class="mr-1" />
                            <font-awesome-icon v-else :icon="['far', 'comment']" class="mr-1" />
                            {{ posts.commentAmountOf(post.id as number) }}
                        </div>
                    </div>
                </div>
                <!-- 第二行 -->
                <div class="w-full h-1/2 flex items-center">
                    <!-- 最新评论 -->
                    <div v-if="posts.latestCommentOf(post.id as number)" class="text-xs text-slate-400">
                        <span class="font-bold">
                            <font-awesome-icon :icon="['fas', 'reply']" />
                            {{ posts.latestCommentOf(post.id as number)?.author?.name }}
                        </span>
                        <span class="ml-1">·</span>
                        {{ formatDateDistanceToNow(posts.latestCommentOf(post.id as number)?.createdAt) }}
                    </div>
                    <!-- 发布日期 -->
                    <div v-else class="text-xs text-slate-400">
                        <span class="font-bold">{{ post.author?.name }}</span>
                        <span class="ml-1">发布于</span>
                        {{ formatDateWithoutDetails(post.publishedAt) }}
                    </div>
                </div>
            </RouterLink>
            <div ref="loadMorePostTrigger"></div>
        </div>
        <!-- 侧边栏 -->
        <div class="row-start-2 col-start-5">
            <PostListSidebar />
        </div>
    </div>
</template>