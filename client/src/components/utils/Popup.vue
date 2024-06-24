<script lang="ts">
import { TransitionGroup, defineComponent, onUnmounted, ref } from "vue"
import { ServerError } from "../../utils/ServerError"
import { error } from 'console';

interface Popup {
    id: number
    text: string
    interval: number
    type: PopupType
}

const popups = ref<Popup[]>([])
let nextId = 1

export enum PopupType {
    SUCCESS,
    ERROR,
    WARNING,
    INFO
}

export const showPopup = (text: string, interval: number, type: PopupType) => {
    if (!text || !interval) {
        return
    }

    const id = nextId++
    popups.value.push({ id, text, interval, type })

    setTimeout(() => {
        popups.value = popups.value.filter(popup => popup.id !== id)
    }, interval)
}

export const showErrorPopup = (error: ServerError, interval: number) => {
    if (!error || !interval) {
        return
    }

    const id = nextId++
    popups.value.push({ id, text: error.message, interval, type: PopupType.ERROR })

    setTimeout(() => {
        popups.value = popups.value.filter(popup => popup.id !== id)
    }, interval)
}

export default defineComponent({
    setup() {
        onUnmounted(() => {
            popups.value = []
        })

        return {
            popups,
            showPopup,
            PopupType
        }
    },
})
</script>

<template>
    <div class="fixed left-5 bottom-4 flex flex-col-reverse space-y-2 space-y-reverse z-50">
        <TransitionGroup name="fade">
            <div v-for="popup in popups" :key="popup.id"
                class="px-3 py-3 flex items-center min-w-5 max-w-60 w-fit rounded-md shadow-md mb-2 bg-white" :class="{
                    'bg-red-400': popup.type == PopupType.ERROR,
                    'bg-gray-300': popup.type == PopupType.INFO,
                    'bg-yellow-200': popup.type == PopupType.WARNING,
                    'bg-lime-300': popup.type == PopupType.SUCCESS
                }">
                <div>{{ popup.text }}</div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1
}
</style>
