<script setup lang="ts">
import { Transition, computed, onMounted, ref } from 'vue'
import { Tag, getTags } from '../../api/hook/tagHook'
import { ServerError } from '../../utils/ServerError';
import { PopupType, showErrorPopup, showPopup } from './Popup.vue';
import { usePostsStore } from '../../api/store/posts';

const posts = usePostsStore()
const selectedTags = defineModel<number[]>({ required: true })
const tagTypes = ref<Tag[]>([])

onMounted(async () => {
    await getTags()
        .then((tags: Tag[]) => {
            tagTypes.value = tags
        })
        .catch((error: ServerError) => {
            showPopup("加载帖子分类数据失败", 2000, PopupType.ERROR)
            showErrorPopup(error, 2000)
        })
    
    // 填充默认标签
    if (posts.watchedTag && selectedTags.value.length == 0) {
        selectedTags.value.push(posts.watchedTag.id as number)
    }
})

const handleSelect = (id: number) => {
    if (selectedTags.value.includes(id)) {
        selectedTags.value = selectedTags.value.filter((tag) => tag != id)
    } else {
        selectedTags.value.push(id)
    }
}

// 默认折叠
const isFolded = ref(true)

const selectedTagData = computed(() => {
    return selectedTags.value.map((id) => {
        return tagTypes.value.find((tag) => {
            return tag.id == id
        })
    })
})
</script>

<template>
    <button @click="isFolded = !isFolded" class="mr-auto mb-1 flex items-center">
        <font-awesome-icon v-if="isFolded" :icon="['fas', 'chevron-left']" class="mr-1 text-slate-500" />
        <font-awesome-icon v-else :icon="['fas', 'chevron-right']" class="mr-1 text-slate-500" />
        <span>标签选择</span>
        <Transition name="note">
            <span v-if="selectedTags.length == 0" class="ml-1">
                <div class="bg-red-500 px-1 py-0.5 rounded-md text-sm">
                    <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="text-white font-bold pr-1" />
                    <span class="text-white">请选择一个标签</span>
                </div>
            </span>
        </Transition>
    </button>
    <div class="flex gap-1 mb-1">
        <TransitionGroup name="list">
            <div v-for="tag in selectedTagData" :key="tag?.id" :style="{ 'background-color': tag?.iconColor }"
                class="px-1 py-0.5 rounded-md w-fit h-fit flex items-center text-sm">
                <span class="pr-1 text-white"><font-awesome-icon :icon="tag?.faIcon" /></span>
                <span class="text-white">{{ tag?.title }}</span>
            </div>
        </TransitionGroup>
    </div>
    <Transition name="expand">
        <div v-if="!isFolded" class="flex flex-col">
            <div v-for="tag in tagTypes" @click="handleSelect(tag.id as number)" :key="tag.id"
                class="w-full h-fit flex flex-col items-start hover:bg-slate-300 px-3 py-1"
                :class="{ 'bg-slate-200': selectedTags.includes(tag?.id as number) }">
                <div>
                    <span v-if="!selectedTags.includes(tag?.id as number)"><font-awesome-icon :icon="tag.faIcon"
                            :style="{ 'color': tag.iconColor }" class="mr-1" /></span>
                    <span v-else><font-awesome-icon :icon="['fas', 'check']" :style="{ 'color': tag.iconColor }"
                            class="mr-1" /></span>
                    <span>{{ tag.title }}</span>
                </div>
                <span class="text-sm">{{ tag.description }}</span>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
    @apply transition-transform
}

.expand-enter-from,
.expand-leave-to {
    @apply -translate-x-full
}

.note-enter-active,
.note-leave-active {
    @apply transition-opacity
}

.note-enter-from,
.note-leave-to {
    @apply opacity-0
}

.list-move,
.list-enter-active,
.list-leave-active {
    @apply transition-all
}

.list-enter-from {
    @apply opacity-0 -translate-y-full
}

.list-leave-to {
    @apply opacity-0 translate-x-full
}
</style>