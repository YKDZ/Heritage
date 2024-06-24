<script setup lang="ts">
import { usePostsStore } from '../../api/store/posts';
import { getContentColorForBackground } from '../../utils/color';

const posts = usePostsStore()
</script>

<template>
    <div v-if="posts.watchedTag" class="w-full min-h-32 h-fit flex flex-col items-center justify-center"
        :style="{ 'background-color': posts.watchedTag.iconColor, 'color': getContentColorForBackground(posts.watchedTag.iconColor) }">
        <span class="text-2xl font-bold">
            <font-awesome-icon :icon="posts.watchedTag.faIcon" class="mr-0.5" />
            {{ posts.watchedTag.title }}
        </span>
        <span class="mt-2">{{ posts.watchedTag?.description }}</span>
    </div>
</template>