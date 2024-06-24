<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePostsStore } from '../../api/store/posts';
import router from '../../router/router';
import { useProfileStore } from '../../api/store/profile';

const posts = usePostsStore()
const profile = useProfileStore()

const handleChange = async () => {
    await posts.reload()
}

const inputEl = ref<HTMLInputElement>()
const isInputting = ref(false)
const showMenu = ref(false)

const handleDeleteSearch = async () => {
    posts.searchText("")
    await handleChange()
    inputEl.value?.blur()
}

const handleBlur = async () => {
    setTimeout(() => {
        isInputting.value = false
        showMenu.value = false
    }, 100)
}

const handleFocus = () => {
    isInputting.value = true
    showMenu.value = true
}

const handleSearchPost = () => {
    router.push('/')
    posts.watchTag(null)
    profile.toPostList()
}

const handleEnter = (ev: KeyboardEvent) => {
    if (ev.key == 'Enter') {
        if (!isInputting.value) {
            inputEl.value?.focus()
        } else {
            inputEl.value?.blur()
            handleSearchPost()
        }
    }
}

onkeydown = handleEnter
</script>

<template>
    <div class="relative min-w-fit w-3/5 bg-slate-200 rounded-md px-3 text-sm transition-all text-slate-800"
        :class="{ 'focus': isInputting }">
        <div class="flex items-center">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-slate-600 mr-2" />
            <input type="text" placeholder="搜索" v-model="posts.searchedText" @change="handleChange"
                class="h-8 bg-transparent w-full focus:outline-none" @focus="handleFocus" @blur="handleBlur"
                ref="inputEl">
            <button @click.stop="handleDeleteSearch">
                <font-awesome-icon v-if="posts.searchedText.length > 0" :icon="['fas', 'circle-xmark']" />
            </button>
        </div>
        <div v-if="showMenu && posts.searchedText.length > 0"
            class="absolute z-40 w-full left-0 right-0 mt-2 shadow-md rounded-md h-fit bg-white flex flex-col ">
            <span class="w-full py-1.5 px-3.5 text-sm">帖子</span>
            <button @click.stop="handleSearchPost"
                class="w-full py-2 px-3 mb-2 bg-slate-200 flex items-center justify-start">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-slate-600 mr-2" />
                <span>搜索：{{ posts.searchedText }}</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.focus {
    @apply bg-white border-2 border-slate-300 w-full
}
</style>
