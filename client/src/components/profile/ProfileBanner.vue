<script setup lang="ts">
import { Ref, computed, inject } from 'vue';
import { userKey } from '../../api/keys/user';
import { User, useUserStore } from '../../api/store/user';
import { formatDate } from '../../utils/datetime';

const user = inject<Ref<User>>(userKey)
const auth = useUserStore()

const isSelf = computed(() => {
    return user?.value.id == auth.user?.id
})
</script>

<template>
    <div class="w-full h-44 flex items-center justify-center gap-8" :style="{ 'background-color': `#7B6662` }">
        <!-- 头像 -->
        <div class="relative w-28 h-28 rounded-full overflow-clip border-4 border-white">
            <img src="/avatars/test.png">
            <VTooltip>
                <div
                    class="text-transparent top-0 left-0 w-28 h-28 rounded-full absolute z-40 hover:bg-black hover:bg-opacity-30 flex items-center justify-center hover:text-white">
                    <font-awesome-icon :icon="['fas', 'pen-to-square']" class="text-3xl" />
                </div>
                <template #popper>
                    <span class="block text-xs text-center">上传新头像</span>
                </template>
            </VTooltip>
        </div>
        <!-- 信息栏 -->
        <div class="w-1/2 h-1/2 -mt-2 flex flex-col gap-3">
            <!-- 名称 -->
            <span class="text-2xl text-white">{{ user?.name }}</span>
            <div class="flex items-center gap-4">
                <!-- 在线图标 -->
                <div class="flex items-center gap-1">
                    <span class="h-2 w-2 rounded-full bg-lime-500"></span>
                    <span class="text-xs text-white">在线</span>
                </div>
                <!-- 注册时间 -->
                <span class="text-xs text-white">注册于 {{ formatDate(user?.registeredAt) }}</span>
            </div>
            <!-- 签名 -->
            <div class="
            before:absolute before:top-0 before:left-0 before:bottom-0 before:right-0 before:border-2 before:border-dashed before:border-slate-100 before:border-opacity-60 before:opacity-0 before:hover:opacity-100 before:transition-opacity before:rounded-md
            relative w-4/5 h-24
            flex items-center justify-start">
                <p class="pl-4 py-3 text-sm text-opacity-30 text-white">这个人很懒，什么都没有写...</p>
            </div>
        </div>
    </div>
</template>