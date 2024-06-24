<script setup lang="ts">
import Vditor from 'vditor';
import { computed, onMounted, provide, ref, watch, watchEffect } from 'vue';
import { Comment } from '../../api/hook/commentHook';
import { commentKey } from '../../api/keys/comment';
import CommentToolDropdown from './CommentToolDropdown.vue';
import CommentTimeHover from './CommentTimeHover.vue'

const emits = defineEmits<{
    nav: [targetId: number]
}>()

const props = defineProps<{
    comment: Comment
    parent: Comment | undefined
}>()

const targetComment = ref(props.comment)
const contentDiv = ref<HTMLDivElement>()
// 展开收起部分 默认为关闭状态
const contentToShow = ref(targetComment.value.content)
const isTooLong = ref(false)
const isFolded = ref(true)

// 向子组件提供托管的 Comment
provide(commentKey, targetComment)

const countLines = (text: string): number => {
    return text.split(/\r\n|\r|\n/).length
}

const getFirstNLines = (text: string, n: number): string => {
    const lines = text.split(/\r\n|\r|\n/)
    return lines.slice(0, n).join('\n')
}

// 若太长则取一部分预览用 
// 并引入展开收起按钮
onMounted(() => {
    if (countLines(targetComment.value.content) > 10) {
        contentToShow.value = getFirstNLines(targetComment.value.content, 10)
        isTooLong.value = true
        isFolded.value = false
    } else {
        contentToShow.value = targetComment.value.content
        isTooLong.value = false
    }
})

// 目标评论更新时重新计算
watch(() => targetComment.value.content, () => {
    if (countLines(targetComment.value.content) > 10) {
        contentToShow.value = getFirstNLines(targetComment.value.content, 10)
        isTooLong.value = true
        isFolded.value = false
    } else {
        contentToShow.value = targetComment.value.content
        isTooLong.value = false
    }
})

// 动态更新预览内容
watchEffect(() => {
    if (contentDiv.value) {
        Vditor.preview(contentDiv.value, contentToShow.value, {
            mode: "dark"
        })
    }
})

watch(() => props.comment, () => {
    targetComment.value = props.comment
})

const foldOrUnfoldText = computed(() => {
    return isFolded.value ? "收起" : "展开..."
})

const handleFold = () => {
    if (isFolded.value) {
        isFolded.value = false
        contentToShow.value = getFirstNLines(targetComment.value.content, 10)
    } else {
        isFolded.value = true
        contentToShow.value = targetComment.value.content
    }
}

const getAutorText = computed(() => {
    return props.comment?.author?.name ? props.comment?.author?.name : props.comment?.author?.email
})

const getParentAuthorText = computed(() => {
    return props.parent?.author?.name ? props.parent?.author?.name : props.parent?.author?.email
})

const showToolbar = ref(false)
</script>

<template>
    <div class="w-full flex flex-col items-start" @mouseenter="showToolbar = true" @mouseleave="showToolbar = false">
        <p class="mb-4 mt-4 text-sm">{{ getAutorText }}
            <button v-if="targetComment.parentId" @click="$emit('nav', targetComment.parentId as number)"
                class="rounded-lg bg-slate-200 px-1">
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="pr-1 text-slate-600" /><span
                    class="text-slate-600">{{ getParentAuthorText }}</span>
            </button>
            <CommentTimeHover />
        </p>
        <div ref="contentDiv"></div>
        <button v-if="isTooLong" @click="handleFold" class="
            mt-3 text-sm text-slate-500 w-full text-start hover:text-slate-600">{{ foldOrUnfoldText }}</button>
        <CommentToolDropdown :show="showToolbar" class="self-end" />
    </div>
</template>