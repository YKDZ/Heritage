<script setup lang="ts">
import { onMounted, provide, ref } from 'vue';
import { Badge, getBadges } from '../../api/hook/badgeHook';
import { Tag, getTags } from '../../api/hook/tagHook';
import { getCreatedPosts } from '../../api/hook/userHook';
import { PostsData } from '../../api/store/posts';
import { ServerError } from '../../utils/ServerError';
import { showErrorPopup } from '../utils/Popup.vue';
import { tagsKey } from '../../api/keys/tag';
import { badgesKey } from '../../api/keys/badge';
import ProfilePostBox from './ProfilePostBox.vue';

const postsData = ref<PostsData>()
const tags = ref<Tag[]>([])
const badges = ref<Badge[]>([])
const loadMorePostTrigger = ref<HTMLDivElement>()

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
    await getCreatedPosts(true)
        .then((fetched: PostsData) => {
            postsData.value = fetched
        })
        .catch((error: ServerError) => {
            showErrorPopup(error, 2000)
        })
})
</script>

<template>
    <div class="flex flex-col">
        <ProfilePostBox v-for="post in postsData?.posts" :key="post.id" :post="post" />
        <div ref="loadMorePostTrigger"></div>
    </div>
</template>