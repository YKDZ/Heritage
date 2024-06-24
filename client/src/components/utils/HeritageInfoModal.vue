<script setup lang="ts">
import { Heritage } from '../../assets/heritage/heritage';
import { heritageProvinces } from '../../assets/heritage/regions/province';

const props = defineProps<{
    heritage: Heritage | undefined
    show: boolean
}>()

const emits = defineEmits<{
    close: []
}>()
</script>

<template>
    <Transition name="modal">
        <div v-if="show" @click.self="emits('close')"
            class="z-50 fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center">
            <div class="content overflow-y-scroll w-1/3 h-2/3 bg-slate-700 text-slate-100 rounded-3xl">
                <div class="w-5/6 flex flex-col items-start mx-auto py-8">
                    <span class="font-bold text-4xl border-b-4 border-slate-300 pb-2">{{ heritage?.name }}</span>
                    <!-- 地区等信息 -->
                    <div class="flex flex-col my-2 items-start w-full">
                        <span class="text-sm"><font-awesome-icon :icon="['fas', 'house']" class="text-slate-200" />
                            {{ heritageProvinces.find((province) => heritage?.province == province.id)?.name }}
                        </span>
                        <span class="text-sm">
                            <font-awesome-icon :icon="['fas', 'briefcase']" class="text-slate-200" />
                            {{ heritage?.unit }}
                        </span>
                        <span class="text-sm w-full pb-1 mb-1">
                            <font-awesome-icon :icon="['fas', 'table-list']" class="text-slate-200" />
                            {{ heritage?.type }}
                            <span class="ml-1">
                                {{ heritage?.num }}
                            </span>
                        </span>
                    </div>
                    <p v-for="content in heritage?.content.split('\n')" class="mb-4 last:mb-0">
                        {{ content }}
                    </p>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    @apply transition-opacity duration-300
}

.modal-enter-active .content,
.modal-leave-active .content {
    @apply transition-transform duration-300
}

.modal-enter-from,
.modal-leave-to {
    @apply opacity-0
}

.modal-enter-from .content,
.modal-leave-to .content {
    @apply translate-y-full
}
</style>