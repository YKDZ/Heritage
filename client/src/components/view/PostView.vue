<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, provide, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Post, getPost } from '../../api/hook/postHook';
import { postKey } from '../../api/keys/post';
import { useCommentsStore } from '../../api/store/comments';
import { User, useUserStore } from '../../api/store/user';
import router from '../../router/router';
import { ServerError } from '../../utils/ServerError';
import PostToolDropdown from '../post/PostToolDropdown.vue';
import Loading from '../utils/Loading.vue';
import { PopupType, showErrorPopup, showPopup } from '../utils/Popup.vue';
import PostSideBar from '../post/PostSideBar.vue';
import PostFullScreenModal from '../post/PostFullScreenModal.vue';
import { createHistory } from '../../api/hook/userHook';

const route = useRoute()
const auth = useUserStore()
const comments = useCommentsStore()

const targetPost = ref<Post>({
    id: undefined,
    createdAt: new Date(),
    title: "",
    published: false,
    content: "",
    heritages: [],
    tags: [],
    badges: [],
    publishedAt: undefined,
    author: auth.user as User
})

provide(postKey, targetPost)

const PostRender = defineAsyncComponent({
    loader: () => import('../post/PostRender.vue'),
    loadingComponent: Loading,
})

const PostTitleBox = defineAsyncComponent(() =>
    import('../post/PostTitleBox.vue')
)

const CommentEditor = defineAsyncComponent(() =>
    import("../comment/CommentEditor.vue")
)

onMounted(async () => {
    targetPost.value.id = parseInt(route.params.id.toString())

    if (!targetPost.value.id) {
        router.push("/posts")
        showPopup("未指定帖子 ID", 2000, PopupType.ERROR)
        return
    }

    const fetchedPost = await getPost(targetPost.value.id)
        .catch((error: ServerError) => {
            router.push("/posts")
            showPopup(error.message, 2000, PopupType.ERROR)
        })

    if (fetchedPost) {
        targetPost.value = fetchedPost
        await comments.load(fetchedPost)
            .catch((error: ServerError) => {
                showErrorPopup(error, 2000)
            })
    }

    await logHistory()
})

onUnmounted(() => {
    comments.unload()
})

const logHistory = async () => {
    if (auth.isAuthenticated) {
        await createHistory(targetPost.value.id as number)
    }
}

// 不知道是否有实际作用
const CommentsList = defineAsyncComponent({
    loader: () => import("../comment/CommentsList.vue"),
    loadingComponent: Loading,
})

const showToolbar = ref(false)

const showFullScreenModal = ref(false)
</script>

<template>
    <Header />
    <div class="min-h-screen">
        <PostTitleBox>
            {{ targetPost.title }}
        </PostTitleBox>
        <div v-if="!showFullScreenModal" class="grid grid-cols-5 w-full gap-x-10">
            <div class="col-start-2 col-span-3 flex flex-col mx-auto p-6 w-full">
                <PostRender />
                <PostToolDropdown :show="showToolbar" class="self-end" />
                <CommentsList />
            </div>
            <div class="flex flex-col items-start">
                <PostSideBar @full="showFullScreenModal = true" />
            </div>
        </div>
        <CommentEditor />
        <PostFullScreenModal :show="showFullScreenModal" @close="showFullScreenModal = false" />
    </div>
    <Footer />
</template>