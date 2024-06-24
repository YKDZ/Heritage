<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import PostListBanner from '../post/PostListBanner.vue'

const PostList = defineAsyncComponent(() =>
    import('../post/PostList.vue')
)
</script>

<template>
    <div class="w-full min-h-screen">
        <PostListBanner />
        <PostList />
    </div>
</template>