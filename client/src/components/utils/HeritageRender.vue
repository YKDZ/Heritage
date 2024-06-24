<script setup lang="ts">
import { computed, inject, ref, watchEffect } from 'vue';
import { watch, Ref } from 'vue';
import { Heritage, heritages } from '../../assets/heritage/heritage'
import { Post } from '../../api/hook/postHook';
import { postKey } from '../../api/keys/post';
import HeritageInfoModal from '../utils/HeritageInfoModal.vue'

const post = inject<Ref<Post>>(postKey)
const heritageTargets = ref<Heritage[]>([])

watchEffect(() => {
    heritageTargets.value = heritages.filter((target) =>
        post?.value.heritages.includes(target.id)
    )
})

const handleShowInfoModal = (heritage: Heritage) => {
    selectedHeritage.value = heritage
    showModal.value = true
}

const selectedHeritage = ref<Heritage>()
const showModal = ref(false)
</script>

<template>
    <div class="flex gap-1 mt-1 justify-center w-1/3 flex-wrap">
        <div v-for="heritage in heritageTargets" @click="handleShowInfoModal(heritage)" :key="heritage.id" class="text-sm w-fit text-nowrap bg-amber-500 px-1 py-0.5 rounded-md cursor-pointer">
            {{ heritage.name }}
        </div>
    </div>
    <HeritageInfoModal :show="showModal" :heritage="selectedHeritage" @close="showModal = false" />
</template>