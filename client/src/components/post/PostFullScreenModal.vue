<script setup lang="ts">
import PostRender from './PostRender.vue';

const emits = defineEmits<{
    close: []
}>()
const props = defineProps<{
    show: boolean
}>()
</script>

<template>
    <div v-if="show" class="z-50 fixed top-0 left-0 w-full h-full bg-white flex flex-col overflow-hidden">
        <button @click="emits('close')" class="sticky top-0 z-50 ml-auto px-6 pt-4 text-lg">
            <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
        <div class="px-10 flex-1 overflow-y-scroll pb-12">
            <PostRender />
        </div>
    </div>
</template>

<style scoped>

</style>