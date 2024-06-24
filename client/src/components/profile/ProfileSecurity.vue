<script setup lang="ts">
import { useUserStore } from '../../api/store/user';
import router from '../../router/router';
import { PopupType, showPopup } from '../utils/Popup.vue';

const auth = useUserStore()

const handleLogout = ()  => {
    auth.logout()
    router.push({ name: 'HomeView' })
    showPopup("成功退出登录", 2000, PopupType.SUCCESS)
}
</script>

<template>
    <button @click="handleLogout" class="bg-slate-200 px-2 py-1 rounded-md">
        退出登录
    </button>
</template>