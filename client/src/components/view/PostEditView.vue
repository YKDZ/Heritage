<script setup>
import { onMounted, ref } from 'vue';
import PostEditor from '../post/PostEditor.vue';
import { useRoute } from 'vue-router';

const route = useRoute()
</script>

<template>
    <PostEditor :target="parseInt(route.params.id.toString())" />
</template>