<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { PostsData } from '../../api/store/posts'
import { ServerError } from '../../utils/ServerError'
import { PopupType, showErrorPopup, showPopup } from '../utils/Popup.vue'
import { formatDateDistanceToNow } from '../../utils/datetime'
import { getCreatedPosts } from '../../api/hook/userHook'
import { Post, deletePost } from '../../api/hook/postHook'
import { useProfileStore } from '../../api/store/profile'

const profile = useProfileStore()
const draftsData = ref<PostsData>({ posts: [], page: 0, totalPages: 0, totalPosts: 0 })

onBeforeMount(async () => {
    await updateDraftsList()
})

const updateDraftsList = async () => {
    try {
        const newData = await getCreatedPosts(false)
        draftsData.value = newData
    } catch (error) {
        showErrorPopup(error as ServerError, 2000)
    }
}

const handleDeleteAll = async () => {
    if (draftsData.value.posts.length) {
        try {
            const deletePromises = draftsData.value.posts.map((post: Post) =>
                deletePost(post.id as number).catch((error: ServerError) => {
                    showErrorPopup(error, 2000)
                })
            )
            await Promise.all(deletePromises)
            setTimeout(async () => {
                await updateDraftsList()
                    .then(() => {
                        showPopup("成功删除所有草稿", 2000, PopupType.SUCCESS)
                    })
            }, 200)
        } catch (error) {
            showErrorPopup(error as ServerError, 2000)
        }
    }
}

const loadedDrafts = computed(() => draftsData.value?.posts)
</script>

<template>
    <VDropdown :placements="`bottom-end`">
        <font-awesome-icon :icon="['fas', 'box-archive']"
            class="cursor-pointer text-slate-600 hover:text-slate-800 transition-colors"
            :class="{ 'text-white hover:text-slate-300': !profile.isViewingPost }" />
        <div v-if="loadedDrafts?.length && loadedDrafts?.length > 0"
            class="absolute z-10 ml-2.5 -mt-7 h-5 w-5 text-xs rounded-full bg-blue-400 text-white font-bold flex items-center justify-center">
            <span>{{ loadedDrafts?.length }}</span>
        </div>
        <template #popper>
            <div class="w-96 max-h-96 overflow-y-scroll flex flex-col">
                <span class="w-full flex justify-between text-sm text-slate-800 px-5 py-3 border-b-2 border-slate-500">
                    <span>草稿箱</span>
                    <VTooltip>
                        <button class="text-slate-600 hover:text-slate-800 transition-colors" @click="handleDeleteAll">
                            <font-awesome-icon :icon="['fas', 'trash-can']" class="text-sm" />
                        </button>
                        <template #popper>
                            <span class="text-sm">删除所有草稿</span>
                        </template>
                    </VTooltip>
                </span>
                <RouterLink v-if="loadedDrafts?.length && loadedDrafts?.length > 0" v-for="draft in loadedDrafts"
                    :key="draft.id" class="w-full px-5 py-2 flex flex-col items-center hover:bg-slate-200"
                    :to="`/posts/edit/${draft.id}`">
                    <span class="w-full">
                        {{ draft.title }}
                    </span>
                    <span class="w-full text-sm text-slate-500 flex">
                        {{ formatDateDistanceToNow(draft.createdAt) }}
                    </span>
                </RouterLink>
                <div v-else class="px-5 py-2 text-sm text-slate-400">你还没有草稿</div>
            </div>
        </template>
    </VDropdown>
</template>
