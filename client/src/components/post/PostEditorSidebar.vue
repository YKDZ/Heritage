<script setup lang="ts">
import { Ref, computed, defineAsyncComponent, inject } from 'vue';
import { postKey } from '../../api/keys/post';
import { Post } from '../../api/hook/postHook';
import HeritageSelector from '../utils/HeritageSelector.vue';

const props = defineProps<{
    show: boolean
}>()
const emits = defineEmits<{
    draft: []
    submit: []
    close: []
}>()
const post = inject<Ref<Post>>(postKey) as Ref<Post>

const submitMode = computed(() => {
    if (post) {
        return post.value.published ? (post.value ? "保存编辑" : "发布帖子") : (post.value ? "发布草稿" : "发布帖子")
    } else {
        return ""
    }
})

const TagSelector = defineAsyncComponent(() =>
    import('../utils/TagSelector.vue')
)
</script>

<template>
    <Teleport to="body">
        <Transition name="slide">
            <div v-if="show" @click.self="emits('close')"
                class="fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-30 flex justify-end">
                <div class="content px-2 py-1 w-1/3 flex flex-col bg-white overflow-x-hiddden overflow-y-scroll">
                    <div class="flex items-center pb-2 my-2 border-b-2 border-slate-300">
                        <button @click="emits('submit')"
                            class="px-6 py-2 w-fit bg-orange-500 hover:bg-orange-600 rounded-md text-sm text-white font-bold">
                            {{ submitMode }}
                        </button>
                        <button @click="emits('draft')" v-if="!post.published"
                            class="ml-2 px-6 py-2 w-fit bg-green-600 hover:bg-green-700 rounded-md text-sm text-white font-bold">
                            保存草稿
                        </button>
                        <button @click="emits('close')" class="ml-auto text-lg text-slate-700 hover:text-slate-800">
                            <font-awesome-icon :icon="['fas', 'xmark']" />
                        </button>
                    </div>
                    <TagSelector v-model="post.tags" />
                    <div class="my-1"></div>
                    <HeritageSelector v-model="post.heritages" />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    @apply transition-opacity duration-300
}

.slide-enter-active .content,
.slide-leave-active .content {
    @apply transition-transform duration-300
}

.slide-enter-from,
.slide-leave-to {
    @apply opacity-0
}

.slide-enter-from .content,
.slide-leave-to .content {
    @apply translate-x-full
}
</style>