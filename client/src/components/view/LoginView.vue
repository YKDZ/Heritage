<script setup lang="ts">
import { ref } from "vue";
import router from "../../router/router";
import { ServerError } from "../../utils/ServerError";
import { PopupType, showPopup } from "../utils/Popup.vue";
import { useUserStore } from "../../api/store/user";

const auth = useUserStore()

const email = ref("")
const passworld = ref("")

const handleLogin = async () => {
    await auth.login(email.value, passworld.value)
        .then(() => {
            router.push("/profile/" + auth.user?.id)
            showPopup("登录成功！正在跳转到用户界面...", 2000, PopupType.SUCCESS)
        })
        .catch((error: ServerError) => {
            showPopup(error.message, 2000, PopupType.ERROR)
        })
}
</script>

<template>
    <div class="flex items-center justify-center w-screen h-screen bg-gray-50">
        <form
            class="flex items-start justify-center gap-4 flex-col h-fit w-fit bg-white shadow-md px-6 py-6 rounded-lg">
            <RouterLink to="/" class="mx-auto flex gap-2 items-center">
                <img src="/logo.png" class="w-12" v-tooltip="`点击回到主页`">
                中国非遗论坛
            </RouterLink>
            <label>邮箱地址</label>
            <input v-model.trim="email" type="email">
            <label>密码</label>
            <input v-model.trim="passworld" type="password">
            <button @click.prevent="handleLogin">点击登录</button>
            <span>初来乍到？<RouterLink to="/register">点击注册</RouterLink></span>
        </form>
    </div>
</template>

<style scoped>
input {
    @apply bg-gray-100 rounded-sm w-60 p-2 h-10 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500
}

button {
    @apply ml-auto bg-red-300 px-2 py-1 rounded-lg hover:bg-red-500 text-lg font-sans
}

span {
    @apply ml-auto text-xs -my-2
}

a {
    @apply py-0.5 px-0.5 rounded-sm hover:underline hover:cursor-pointer
}

label {
    @apply -mb-4
}
</style>