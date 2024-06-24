import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export enum ProfileContnet {
    POST_HISTORY,
    COMMENT_HISTORY,
    VIEW_HISTORY,
    SECURITY
}

export const useProfileStore = defineStore('profile', () => {
    // 前置
    const route = useRoute()
    // 
    const inPostList = ref(false)
    const viewedProfileContent = ref<ProfileContnet>(ProfileContnet.POST_HISTORY)

    const isViewingPost = computed(() => {
        return inPostList.value || route.path !== '/'
    })

    const viewProfileContent = (content: ProfileContnet) => {
        viewedProfileContent.value = content
    }

    const toHomeBanner = () => {
        inPostList.value = false
    }

    const toPostList = () => {
        inPostList.value = true
    }

    return {
        inPostList,
        isViewingPost,
        viewedProfileContent,
        viewProfileContent,
        toHomeBanner,
        toPostList
    }
})