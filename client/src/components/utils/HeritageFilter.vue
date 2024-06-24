<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { usePostsStore } from '../../api/store/posts';
import { heritageTypes } from '../../assets/heritage/heritage';

const posts = usePostsStore();
const selector = ref<HTMLDivElement | null>(null);
const showSelector = ref(false);

const handleFilter = (type: string) => {
    if (!posts.selectedHeritagesTypes.includes(type)) {
        posts.heritageTypeFilter([...posts.selectedHeritagesTypes, type]);
    } else {
        posts.heritageTypeFilter(posts.selectedHeritagesTypes.filter((target) => target !== type));
    }
};

const handleClickOutside = (event: MouseEvent) => {
    if (selector.value && !selector.value.contains(event.target as Node)) {
        showSelector.value = false;
    }
};

onclick = handleClickOutside
</script>

<template>
    <div ref="selector" class="relative overflow-visible text-sm">
        <button @click="showSelector = !showSelector" class="bg-slate-200 px-3 py-2 rounded-md hover:bg-slate-300">
            <font-awesome-icon v-if="showSelector" :icon="['fas', 'chevron-up']" class="mr-0.5 text-slate-800" />
            <font-awesome-icon v-else :icon="['fas', 'chevron-down']" class="mr-0.5 text-slate-800" />
            非遗类型
        </button>
        <div v-if="showSelector"
            class="absolute top-full min-w-48 w-fit text-nowrap mt-1 rounded-md z-40 transition-all bg-white shadow-md opacity-95">
            <div v-for="type in heritageTypes" @click="handleFilter(type)" :key="type"
                class="px-3 py-2 hover:bg-slate-300"
                :class="{ 'bg-slate-200': posts.selectedHeritagesTypes.includes(type) }">
                <font-awesome-icon v-if="posts.selectedHeritagesTypes.includes(type)" :icon="['fas', 'check']"
                    class="mr-2" />
                <span>{{ type }}</span>
            </div>
        </div>
    </div>
</template>
