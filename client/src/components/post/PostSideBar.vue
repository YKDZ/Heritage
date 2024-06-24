<script setup lang="ts">
import { Post } from '../../api/hook/postHook';
import { postKey } from '../../api/keys/post';
import { useCommentsStore } from '../../api/store/comments';
import { useUserStore } from '../../api/store/user';
import router from '../../router/router';
import { Ref, inject } from 'vue';

const auth = useUserStore()
const comments = useCommentsStore()

const emits = defineEmits<{
    full: []
    edit: []
}>()
const post = inject<Ref<Post>>(postKey)

const handleEdit = () => {
    router.push({ name: 'PostEditView', params: { id: post?.value.id } })
}
</script>

<template>
    <div class="sticky top-16 flex flex-col gap-3 mt-8">
        <div v-if="!post?.published" class="bg-slate-200 px-2 py-2 rounded-md text-center text-sm">
            <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" />
            草稿状态
        </div>
        <button v-if="post?.published" class="bg-cyan-500 text-white font-bold hover:bg-cyan-600"
            @click="comments.createNew()">回复</button>
        <button v-if="post?.author.id == auth.user?.id || auth.user?.isAdmin == 1"
            class="bg-teal-500 text-white font-bold hover:bg-teal-600" @click="handleEdit">编辑</button>
        <button class="bg-slate-200 hover:bg-slate-300" @click="emits('full')">全屏</button>
    </div>
</template>

<style scoped>
button {
    @apply px-14 py-2 rounded-md text-sm
}
</style>
