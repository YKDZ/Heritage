<script setup lang="ts">
import { useUserStore } from '../../api/store/user';
import HeaderUserMenu from './HeaderUserMenu.vue'
import PostSearchBar from '../post/PostSearchBar.vue'
import { useProfileStore } from '../../api/store/profile';
import { defineAsyncComponent } from 'vue';
import router from '../../router/router';
import { useRoute } from 'vue-router';

const auth = useUserStore()
const route = useRoute()
const profile = useProfileStore()

const PostDraftBox = defineAsyncComponent(() =>
    import('../post/PostDraftBox.vue')
)

const handlePostList = () => {
    profile.toHomeBanner()
    router.push('/')
}
</script>

<template>
    <div class="flex gap-5 items-center h-12 fixed bg-white w-full z-40 transition-all duration-700 shadow-lg"
        :class="{ 'bg-black bg-opacity-5 text-white shadow-none': !profile.isViewingPost }">
        <VTooltip>
            <div v-if="route.name != `HomeView`" @click="router.push({ name: 'HomeView' })"
                class="absolute top-1.5 ml-4 z-40 bg-slate-200 hover:bg-slate-300 rounded-lg w-9 h-9 flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </div>
            <template #popper>
                <span class="block text-sm text-center">返回帖子列表</span>
            </template>
        </VTooltip>
        <div class="flex items-center space-x-8 ml-48">
            <VTooltip>
                <RouterLink @click="profile.toPostList()" to="/" class="text-lg">
                    中国非物质文化遗产论坛
                </RouterLink>
                <template #popper>
                    <span class="text-sm">回到帖子列表</span>
                </template>
            </VTooltip>
            <button class="text-sm" @click="handlePostList">首页</button>
        </div>
        <div class="w-1/6 ml-auto flex justify-end">
            <PostSearchBar />
        </div>
        <div class="justify-items-end flex items-center space-x-8 mr-52">
            <RouterLink v-if="!auth.isAuthenticated" to="/login" class="text-sm">登录</RouterLink>
            <div v-else class="flex items-center space-x-8 text-sm">
                <PostDraftBox />
                <HeaderUserMenu />
            </div>
        </div>
    </div>
    <!-- 占位 -->
    <div v-if="profile.isViewingPost" class="h-12"></div>
</template>