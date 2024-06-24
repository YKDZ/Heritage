<script setup lang="ts">
import Vditor from 'vditor';
import { Ref, inject, ref, watchEffect } from 'vue';
import { Post } from '../../api/hook/postHook';
import { postKey } from '../../api/keys/post';
import { formatDateDistanceToNow, formatDateWithoutDetails } from '../../utils/datetime';

const post = inject<Ref<Post>>(postKey) as Ref<Post>
const contentDiv = ref<HTMLDivElement>()

watchEffect(async () => {
    if (contentDiv.value && post?.value) {
        Vditor.preview(contentDiv.value, post.value.content, {
            mode: "dark",
        })
    }
})
</script>

<template>
    <div class="flex items-center gap-3 mb-2">
        <span class="text-sm font-bold text-slate-800">{{ post.author.name }}</span>
        <VTooltip>
            <span class="text-xs text-slate-600 hover:underline">
                {{ formatDateWithoutDetails(post.createdAt) }}
            </span>
            <template #popper>
                {{ formatDateDistanceToNow(post.createdAt) }}
            </template>
        </VTooltip>
    </div>
    <div ref="contentDiv"></div>
</template>