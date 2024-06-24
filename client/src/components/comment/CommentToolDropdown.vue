<script setup lang="ts">
import { inject } from 'vue';
import { Comment } from '../../api/hook/commentHook';
import { useCommentsStore } from '../../api/store/comments';
import { useUserStore } from '../../api/store/user';
import { commentKey } from '../../api/keys/comment';

const auth = useUserStore()
const comments = useCommentsStore()
// todo: 处理工具栏隐藏
const props = defineProps<{
    show: boolean
}>()

const target = inject(commentKey)
</script>

<template>
    <div class="flex justify-center items-center">
        <button @click="comments.replyTo(target as Comment)" class="text-slate-500 text-sm mr-1 -mt-1 hover:text-slate-600">回复</button>
        <VDropdown placement="bottom-end">
            <font-awesome-icon :icon="['fas', 'ellipsis']" class="
            w-5 h-5 p-2 text-slate-500 
            hover:bg-slate-300 hover:rounded-full" />
            <template #popper>
                <div class="flex flex-col items-start pl-4 py-4 pr-8 gap-2">
                    <button v-if="target?.author?.id == auth.user?.id || auth.user?.isAdmin == 1"
                        @click="comments.edit(target as Comment)">
                        <font-awesome-icon :icon="['fas', 'pen-to-square']" class="mr-2" />编辑
                    </button>
                    <button v-if="target?.author?.id == auth.user?.id || auth.user?.isAdmin == 1"
                        @click="comments.handleDelete(target?.id as number)">
                        <font-awesome-icon :icon="['fas', 'trash']" class="mr-2" />删除
                    </button>
                </div>
            </template>
        </VDropdown>
    </div>
</template>