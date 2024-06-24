<script setup lang="ts">
import Vditor from 'vditor';
import { Ref, computed, inject, nextTick, onUnmounted, ref, watch } from 'vue';
import { CommentEditorMode, useCommentsStore } from '../../api/store/comments';
import { PopupType, showPopup } from '../utils/Popup.vue';
import { Post } from '../../api/hook/postHook';
import { postKey } from '../../api/keys/post';

const post = inject<Ref<Post>>(postKey)
const comments = useCommentsStore()
const vditor = ref<Vditor | null>(null)
const handledContent = ref<string>(comments.targetContent || "")

const setupVditor = () => {
    vditor.value = new Vditor('vditor', {
        height: "12rem",
        width: "100%",
        mode: "wysiwyg",
        value: handledContent.value,
        after: () => {
            vditor.value?.setValue(handledContent.value || "")
        },
        input: (value: string) => {
            handledContent.value = value
        },
    })
}

onUnmounted(() => {
    vditor.value?.destroy()
    vditor.value = null
})

watch(() => comments.isShowEditor, async (newVal) => {
    if (newVal) {
        handledContent.value = comments.targetContent || ""
        await nextTick()
        setupVditor()
    } else {
        vditor.value?.destroy()
        vditor.value = null
    }
})

const handleSave = () => {
    if (vditor.value?.getValue() != handledContent.value) {
        showPopup("请等待编辑器保存你的内容后再试", 2000, PopupType.WARNING)
        return
    }
    if (comments.editorMode == CommentEditorMode.CREATE) {
        comments.handleCreate(handledContent.value)
    } else if (comments.editorMode == CommentEditorMode.REPLY) {
        comments.handleReply(handledContent.value, comments.replyTarget?.id as number)
    } else if (comments.editorMode == CommentEditorMode.EDIT) {
        const newComment = comments.editTarget
        if (newComment) {
            newComment.content = handledContent.value
            comments.handleUpdate(newComment)
        }
    }
    comments.close()
}

const submitText = computed(() => {
    return comments.isForUpdate ? "保存修改" : "发表回复"
})

const targetPostText = computed(() => {
    return post?.value.title
})

const targetCommnetText = computed(() => {
    if (comments.editorMode == CommentEditorMode.REPLY)
        return comments.replyTarget?.author?.name ? comments.replyTarget?.author?.name : comments.replyTarget?.author?.email as string
})
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="comments.isShowEditor"
                class="fixed top-0 left-0 w-full h-full z-50 flex items-end justify-center">
                <div
                    class="content bg-white w-2/3 h-fit flex flex-col items-start p-3 rounded-t-xl shadow-slate-600 shadow-md bg-opacity-90">
                    <div class="flex mb-2 mt-1 w-full justify-between">
                        <span class="text-sm bg-slate-200 rounded-md h-fit w-fit mr-2 py-0.5 px-1">
                            <font-awesome-icon :icon="['fas', 'reply']" class="text-slate-800 mr-0.5" />
                            {{ targetPostText }}
                        </span>
                        <span v-if="comments.editorMode == CommentEditorMode.REPLY"
                            class="text-sm bg-slate-200 py-0.5 px-1 rounded-md h-fit w-fit">
                            <font-awesome-icon :icon="['fas', 'at']" class="text-slate-800" />
                            {{ targetCommnetText }}
                        </span>
                        <div class="ml-auto mr-1 flex gap-x-3">
                            <button @click="comments.saveReplyDraft(handledContent || '')">
                                <font-awesome-icon :icon="['fas', 'minus']" />
                            </button>
                            <button @click="comments.close()">
                                <font-awesome-icon :icon="['fas', 'xmark']" />
                            </button>
                        </div>
                    </div>
                    <!-- 高度硬编码在上方初始化处 -->
                    <div id="vditor"></div>
                    <button @click.prevent="handleSave"
                        class="mt-2 px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-sm text-white font-bold">
                        {{ submitText }}
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    @apply transition-opacity
}

.modal-enter-active .content,
.modal-leave-active .content {
    @apply transition-transform
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
