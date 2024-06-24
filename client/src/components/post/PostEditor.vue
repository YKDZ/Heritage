<script setup lang="ts">
import Vditor from 'vditor';
import { computed, onMounted, onUnmounted, provide, ref } from 'vue';
import { Post, createPost, getPost, updatePost } from '../../api/hook/postHook';
import { postKey } from '../../api/keys/post';
import { User, useUserStore } from '../../api/store/user';
import router from '../../router/router';
import { ServerError } from '../../utils/ServerError';
import { defaultToolbarOptions } from '../../utils/VditorOptions';
import { PopupType, showErrorPopup, showPopup } from '../utils/Popup.vue';
import PostEditorSidebar from '../post/PostEditorSidebar.vue';
import { useProfileStore } from '../../api/store/profile';

const auth = useUserStore()
const profile = useProfileStore()
const props = defineProps<{
    target?: number
}>()

const vditor = ref<Vditor | null>(null)

const targetPost = ref<Post>({
    id: props.target,
    createdAt: new Date(),
    publishedAt: undefined,
    title: "",
    published: false,
    content: "",
    heritages: [],
    tags: [],
    badges: [],
    author: auth.user as User
})

provide(postKey, targetPost)

const initializePost = async () => {
    if (props.target) {
        await getPost(props.target)
            .then((post: Post) => {
                if (post) {
                    Object.assign(targetPost.value, post)
                }
            })
            .catch((error: ServerError) => {
                router.push({ 'name': 'HomeView' })
                showErrorPopup(error, 2000)
            })
    }
}

const setupVditor = () => {
    vditor.value = new Vditor('vditor', {
        mode: "sv",
        value: targetPost.value.content,
        after: () => {
            vditor.value?.setValue(targetPost.value.content)
        },
        input: (value: string) => {
            targetPost.value.content = value
        },
        ...defaultToolbarOptions
    })
}

onMounted(async () => {
    await initializePost()
        .then(() => {
            setupVditor()
        })
})

onUnmounted(() => {
    vditor.value?.destroy()
    vditor.value = null
})

const handleSubmit = async () => {
    await savePost(true)
}

const handleDraft = async () => {
    await savePost(false)
}

const savePost = async (publish: boolean) => {
    if (vditor.value?.getValue() != targetPost.value.content) {
        showPopup("请等待编辑器保存你的内容后再试", 2000, PopupType.WARNING)
        return
    }
    if (targetPost.value.title.length < minLength) {
        showPopup("帖子标题字数不足", 2000, PopupType.WARNING)
        return
    }
    if (targetPost.value.tags.length < 1) {
        showPopup("至少需要选择一个标签", 2000, PopupType.WARNING)
        return
    }
    if (publish) {
        targetPost.value.published = true
    }
    if (props.target) {
        await updatePost(targetPost.value)
            .then(async (post: Post) => {
                await router.push({ name: 'PostView', params: { id: post.id } })
                showPopup("保存成功！正在跳转到帖子界面...", 2000, PopupType.SUCCESS)
            })
            .catch((error: ServerError) => {
                showErrorPopup(error, 2000)
            })
    } else {
        await createPost(targetPost.value)
            .then(async (post: Post) => {
                await router.push({ name: 'PostView', params: { id: post.id } })
                showPopup("创建成功！正在跳转到帖子界面...", 2000, PopupType.SUCCESS)
            })
            .catch((error: ServerError) => {
                showErrorPopup(error, 2000)
            })
    }
}

const backText = computed(() => {
    return !props.target ? "返回帖子列表" : "返回帖子界面"
})

const minLength = 5
const maxLength = 100

const length = computed(() => {
    if (targetPost.value.title.length >= minLength) {
        return `${targetPost.value.title.length}/${maxLength}`
    } else {
        return `还需输入 ${minLength - targetPost.value.title.length} 个字`
    }
})

const handleBack = () => {
    if (props.target) {
        router.push({ name: 'PostView', params: { id: props.target } })
    } else {
        profile.toPostList()
        router.push({ name: 'HomeView' })
    }
}

const showSidebar = ref(false)
</script>

<template>
    <div class="flex flex-col h-screen w-screen pt-2">
        <div class="flex items-center text-xl mb-2 w-screen px-2">
            <!-- 返回按钮 -->
            <button @click="handleBack" class="ml-2 flex items-center">
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="text-slate-500 pr-1" />
                <span>{{ backText }}</span>
            </button>
            <!-- 标题输入框 -->
            <div
                class="ml-2 flex-grow border-2 border-slate-500 rounded-2xl flex items-center justify-between px-3 py-0.5">
                <input v-model.trim="targetPost.title" type="text" placeholder="请输入标题（5-100字）"
                    class="focus:outline-none bg-transparent w-full" :minlength="minLength" :maxlength="maxLength"
                    name="title">
                <span class="text-nowrap text-slate-600">{{ length }}</span>
            </div>
            <!-- 工具栏 -->
            <button @click="showSidebar = true"
                class="ml-2 px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-sm text-white font-bold">
                工具栏
            </button>
        </div>
        <div id="vditor" class="flex-grow overflow-y-clip overflow-x-hidden"></div>
    </div>
    <PostEditorSidebar :show="showSidebar" @submit="handleSubmit" @draft="handleDraft" @close="showSidebar = false" />
</template>
