<script setup lang="ts">
import { Ref, inject } from 'vue';
import { commentKey } from '../../api/keys/comment';
import { Comment } from '../../api/hook/commentHook';
import { formatDate } from '../../utils/datetime';

const comment = inject<Ref<Comment>>(commentKey)
</script>

<template>
    <VTooltip class="inline">
        <span class="ml-3 text-slate-500 hover:text-slate-600 transition-colors">{{ formatDate(comment?.createdAt) }}</span>
        <template #popper>
            <span class="text-slate-200">最后更新于: {{ formatDate(comment?.updatedAt) }}</span>
        </template>
    </VTooltip>
</template>