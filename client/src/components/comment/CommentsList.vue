<script setup lang="ts">
import { ComponentPublicInstance, Ref, inject, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import { Comment } from '../../api/hook/commentHook';
import { useCommentsStore } from '../../api/store/comments';
import CommentBox from './CommentBox.vue';
import { postKey } from '../../api/keys/post';
import { Post } from '../../api/hook/postHook';

const post = inject<Ref<Post>>(postKey)
const comments = useCommentsStore()
const commentEls: Map<number, Element | ComponentPublicInstance> = new Map()
const loadMoreCommentTrigger = ref<HTMLDivElement>()

onMounted(() => {
    if (loadMoreCommentTrigger.value) {
        observer.observe(loadMoreCommentTrigger.value)
    }
})

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && comments.isLoaded) {
        comments.loadMoreComments()
    }
})

onBeforeUnmount(() => {
    if (loadMoreCommentTrigger.value) {
        observer.unobserve(loadMoreCommentTrigger.value)
    }
})

onUnmounted(() => {
    comments.unload()
})

const getParent = (comment: Comment): Comment | undefined => {
    if (comment.parentId) {
        return comments.loadedComments.find((parent: Comment) => parent.id == comment.parentId)
    }
}

const addNavEl = (commentId: number | undefined, commentEl: Element | null) => {
    if (commentEl && commentId) {
        commentEls.set(commentId, commentEl)
    }
}

const scrollToComment = (commentId: number) => {
    const el = commentEls.get(commentId)
    if (el instanceof Element) {
        const initialObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    el.classList.add('breath')
                    setTimeout(() => {
                        el.classList.remove('breath')
                    }, 800)
                } else {
                    el.scrollIntoView({ behavior: 'smooth' })

                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                el.classList.add('breath')
                                setTimeout(() => {
                                    el.classList.remove('breath')
                                    observer.disconnect()
                                }, 800)
                            }
                        })
                    }, { threshold: 1.0 })

                    observer.observe(el)
                }
                initialObserver.disconnect()
            })
        }, { threshold: 1.0 })

        initialObserver.observe(el)
    }
}
</script>

<template>
    <div v-if="comments.loadedComments.length > 0" class="relative flex flex-col items-center justify-center w-full">
        <TransitionGroup name="comments">
            <div v-for="comment in comments.loadedComments"
                :ref="(commentEl) => addNavEl(comment.id, commentEl as Element)" :key="comment.id"
                class="w-full border-t-2 border-slate-300 scroll-mt-16 last:border-b-2 first:border-slate-400">
                <CommentBox @nav="(commentId) => scrollToComment(commentId)" :comment="comment"
                    :parent="getParent(comment)" />
            </div>
        </TransitionGroup>
    </div>
    <div ref="loadMoreCommentTrigger" class="h-1"></div>
    <div v-if="post?.published" @click="comments.createNew()" class="
            before:absolute before:top-0 before:left-0 before:bottom-0 before:right-0 before:border-2 before:border-dashed before:border-slate-300 before:opacity-0 before:hover:opacity-100 before:transition-opacity before:rounded-md
            relative mt-2 w-full h-24
            flex items-center justify-start">
        <p class="pl-2 text-slate-400">说点什么吧...</p>
    </div>
</template>

<style scoped>
@keyframes breath {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

.breath {
    animation: breath 0.8s ease-in-out;
}

.comments-move,
.comments-enter-active,
.comments-leave-active {
    @apply transition-all duration-300
}

.comments-enter-from,
.comments-leave-to {
    @apply translate-x-6
}

.comments-leave-active {
    @apply absolute
}
</style>