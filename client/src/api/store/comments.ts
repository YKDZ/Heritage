import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { PopupType, showErrorPopup, showPopup } from '../../components/utils/Popup.vue'
import { ServerError } from '../../utils/ServerError'
import { Comment, createComment, deleteComment, updateComment } from '../hook/commentHook'
import { Post, getComments } from '../hook/postHook'
import { User, useUserStore } from './user'

export interface CommentsData {
    comments: Comment[];
    page: number;
    totalPages: number;
    totalComments: number;
}

export enum CommentEditorMode {
    CREATE,
    REPLY,
    EDIT
}

// 被 PostView 及其子组件使用
// 储存当前页面的评论列表以及评论编辑器状态数据
export const useCommentsStore = defineStore('comments', () => {
    // 前置
    const auth = useUserStore()
    // 需要暴露
    const commentData = ref<CommentsData | null>(null)
    const post = ref<Post | null>(null)
    const currentPage = ref(0)
    const currentReplyTarget = ref<Comment | null>(null)
    const currentEditTarget = ref<Comment | null>(null)
    const showEditor = ref(false)
    const commentEditorMode = ref<CommentEditorMode>(CommentEditorMode.CREATE)
    const loaded = ref(false)
    const savedReplyContent = ref("")

    // 必须在 PostView 处初始化和卸载
    const load = async (target: Post) => {
        post.value = target
        await loadMoreComments()
            .catch((error: ServerError) => {
                showErrorPopup(error, 2000)
            })
        loaded.value = true
    }

    const unload = () => {
        commentData.value = null
        post.value = null
        currentPage.value = 0
        currentReplyTarget.value = null
        currentEditTarget.value = null
        showEditor.value = false
        commentEditorMode.value = CommentEditorMode.CREATE
        loaded.value = false
        savedReplyContent.value = ""
    }

    const createNew = () => {
        currentReplyTarget.value = null
        currentEditTarget.value = null
        commentEditorMode.value = CommentEditorMode.CREATE
        showEditor.value = true
    }

    const replyTo = (target: Comment) => {
        currentReplyTarget.value = target
        currentEditTarget.value = null
        commentEditorMode.value = CommentEditorMode.REPLY
        showEditor.value = true
    }

    const edit = (target: Comment) => {
        currentReplyTarget.value = null
        currentEditTarget.value = target
        commentEditorMode.value = CommentEditorMode.EDIT
        showEditor.value = true
    }

    const isLoaded = computed(() =>
        loaded.value
    )

    const editorMode = computed(() =>
        commentEditorMode.value
    )

    const loadedComments = computed(() => {
        if (commentData.value) {
            return commentData.value.comments
        } else {
            return []
        }
    })

    const targetContent = computed(() => {
        if (editorMode.value == CommentEditorMode.EDIT && editTarget.value) {
            return editTarget.value.content
        } else if (editorMode.value == CommentEditorMode.REPLY && replyTarget.value) {
            if (savedReplyContent.value != "") {
                return savedReplyContent.value
            } else {
                return ''
            }
        } else {
            return ''
        }
    })

    const replyTarget = computed(() =>
        currentReplyTarget.value
    )

    const editTarget = computed(() =>
        currentEditTarget.value
    )

    const isShowEditor = computed(() =>
        showEditor.value
    )

    const isForUpdate = computed(() =>
        commentEditorMode.value == CommentEditorMode.EDIT ? true : false
    )

    const close = () => {
        showEditor.value = false
        savedReplyContent.value = ""
    }

    const saveReplyDraft = (content: string) => {
        savedReplyContent.value = content
        showEditor.value = false
    }

    const loadMoreComments = async (): Promise<void> => {
        if (post.value) {

            currentPage.value++
            await getComments(post.value?.id as number, currentPage.value, 10)
                .then((newData: CommentsData) => {
                    if (commentData.value) {
                        commentData.value.totalComments = newData.totalComments
                        commentData.value.totalPages = newData.totalPages
                        newData.comments.forEach((newComment: Comment) => {
                            commentData.value?.comments.push(newComment)
                        })
                    } else {
                        commentData.value = newData
                    }
                })
                .catch((error: ServerError) => {
                    showErrorPopup(error, 2000)
                    throw error
                })
        } else {
            showPopup("Post 未提供，无法加载评论", 2000, PopupType.ERROR)
        }
    }

    const handleCreate = async (content: string) => {
        await createComment({
            content: content,
            postId: post.value?.id,
            author: auth.user as User
        } as Comment)
            .then((newComment: Comment) => {
                commentData.value?.comments.push(newComment)
                showPopup("成功回复帖子", 2000, PopupType.SUCCESS)
            })
            .catch((error) => {
                showErrorPopup(error, 2000)
            })
    }

    const handleReply = async (content: string, parent: number) => {
        await createComment({
            content: content,
            postId: post.value?.id,
            author: auth.user as User,
            parentId: parent
        } as Comment)
            .then((newComment: Comment) => {
                commentData.value?.comments.push(newComment)
                showPopup("成功回复帖子", 2000, PopupType.SUCCESS)
            })
            .catch((error) => {
                showErrorPopup(error, 2000)
            })
    }

    const handleUpdate = async (comment: Comment) => {
        await updateComment(comment)
            .then((newComment: Comment) => {
                if (commentData.value) {
                    commentData.value.comments = commentData.value.comments.map((comment) =>
                        comment.id == newComment.id ? newComment : comment
                    )
                    showPopup("成功保存修改", 2000, PopupType.SUCCESS)
                }
            })
            .catch((error) => {
                showPopup(error, 2000, PopupType.ERROR)
            })
    }

    const handleDelete = async (commentId: number) => {
        await deleteComment(commentId)
            .then(() => {
                if (commentData.value) {
                    commentData.value.comments = commentData.value?.comments.filter((comment) => comment.id != commentId)
                }
                showPopup("成功删除评论", 2000, PopupType.SUCCESS)
            })
            .catch((error: ServerError) => {
                showPopup(error.message, 2000, PopupType.ERROR)
            })
    }

    return {
        commentData,
        currentPage,
        currentReplyTarget,
        loadedComments,
        isShowEditor,
        editTarget,
        replyTarget,
        targetContent,
        editorMode,
        isForUpdate,
        isLoaded,
        loaded,
        savedReplyContent,
        close,
        edit,
        replyTo,
        createNew,
        load,
        unload,
        loadMoreComments,
        handleDelete,
        handleCreate,
        handleReply,
        handleUpdate,
        saveReplyDraft
    }
})