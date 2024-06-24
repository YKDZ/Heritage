<script setup lang="ts">
import { inject, onBeforeMount, ref, Ref } from 'vue';
import { getBadges, getTags, Post } from '../../api/hook/postHook';
import { Tag } from '../../api/hook/tagHook';
import { postKey } from '../../api/keys/post';
import { usePostsStore } from '../../api/store/posts';
import { useProfileStore } from '../../api/store/profile';
import router from '../../router/router';
import { getContentColorForBackground } from '../../utils/color';
import { ServerError } from '../../utils/ServerError';
import HeritageRender from '../utils/HeritageRender.vue';
import { showErrorPopup } from '../utils/Popup.vue';
import { Badge } from '../../api/hook/badgeHook';

const tags = ref<Tag[]>([])
const badges = ref<Badge[]>([])
const post = inject<Ref<Post>>(postKey)?.value
const posts = usePostsStore()
const profile = useProfileStore()

onBeforeMount(async () => {
    await getTags(post?.id as number)
        .then((fetched: Tag[]) => {
            if (posts.watchedTag && tags.value.length > 1) {
                fetched.sort((tag) => tag.id == posts.watchedTag?.id ? -1 : 1)
            }
            tags.value = fetched
        })
        .catch((error: ServerError) => {
            showErrorPopup(error, 2000)
        })
    await getBadges(post?.id as number)
        .then((fetched: Badge[]) => {
            badges.value = fetched
        })
        .catch((error: ServerError) => {
            showErrorPopup(error, 2000)
        })
})

const handleTagClick = (tag: Tag) => {
    posts.watchTag(tag)
    profile.toPostList()
    router.push('/')
}
</script>

<template>
    <div v-if="tags.length > 0" class="min-h-36 h-fit py-3 w-full flex flex-col items-center justify-center"
        :style="{ 'background-color': tags[0].iconColor }">
        <!-- 标签部分 -->
        <!-- 需要依据标签决定背景色 故不拆分模块 -->
        <div class="flex items-center gap-1 mb-1">
            <div v-for="badge in badges" :key="badge.id">
                <VTooltip>
                    <font-awesome-icon :icon="badge.faIcon" class="w-3 h-3 rounded-full mr-0.5 p-1 shadow-md"
                        :style="{ 'color': getContentColorForBackground(badge.iconColor), 'background-color': badge.iconColor }" />
                    <template #popper>
                        <span class="text-sm">{{ badge.name }}</span>
                    </template>
                </VTooltip>
            </div>
            <div v-for="tag in tags" :key="tag.id" @click="handleTagClick(tag)"
                :style="{ 'background-color': getContentColorForBackground(tag.iconColor), 'color': tag.iconColor }"
                class="px-1 py-0.5 w-fit h-fit rounded-md cursor-pointer">
                <VTooltip>
                    <font-awesome-icon :icon="tag.faIcon" class="w-4 mr-0.5 text-center" />
                    <span>{{ tag.title }}</span>
                    <template #popper>
                        <span>{{ tag.description }}</span>
                    </template>
                </VTooltip>
            </div>
        </div>
        <!-- 标题插槽 -->
        <span class="text-2xl text-white">
            <slot></slot>
        </span>
        <HeritageRender />
    </div>
</template>