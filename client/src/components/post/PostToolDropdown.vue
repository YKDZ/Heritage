<script setup lang="ts">
import { Ref, inject } from 'vue';
import { useUserStore } from '../../api/store/user';
import { Post, deletePost } from '../../api/hook/postHook';
import { postKey } from '../../api/keys/post';
import { useCommentsStore } from '../../api/store/comments';
import router from '../../router/router';
import { PopupType, showErrorPopup, showPopup } from '../utils/Popup.vue';
import { ServerError } from '../../utils/ServerError';

const auth = useUserStore()
const comments = useCommentsStore()
const post = inject<Ref<Post>>(postKey)

const handleEdit = () => {
    router.push({ name: 'PostEditView', params: { id: post?.value.id } })
}

const handleDelete = async () => {
    await deletePost(post?.value.id as number)
        .then(() => {
            router.push(`/posts`)
            showPopup("成功删除帖子，正在跳转到帖子列表...", 2000, PopupType.SUCCESS)
        })
        .catch((error: ServerError) => {
            showErrorPopup(error, 2000)
        })
}
</script>

<template>
    <div class="flex items-center justify-center">
        <button v-if="post?.published" @click="comments.createNew()" class="text-slate-500 text-sm mr-1 -mb-1 hover:text-slate-600">
            回复
        </button>
        <VDropdown placement="bottom-end">
            <font-awesome-icon :icon="['fas', 'ellipsis']"
                class="w-5 h-5 p-2  text-slate-500 hover:rounded-full hover:bg-slate-300 mt-2" />
            <template #popper>
                <div class="flex flex-col items-start pl-4 py-4 pr-8 gap-2">
                    <button v-if="post?.author.id == auth.user?.id || auth.user?.isAdmin == 1"
                        @click.prevent="handleEdit">
                        <font-awesome-icon :icon="['fas', 'pen-to-square']" class="mr-2" />
                        编辑
                    </button>
                    <button v-if="post?.author.id == auth.user?.id || auth.user?.isAdmin == 1" @click="handleDelete">
                        <font-awesome-icon :icon="['fas', 'trash']" class="mr-2" />
                        删除
                    </button>
                </div>
            </template>
        </VDropdown>
    </div>
</template>