import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { showErrorPopup } from '../../components/utils/Popup.vue'
import { ServerError } from '../../utils/ServerError'
import { Comment } from '../hook/commentHook'
import { Post, getCommentAmount, getLatestComment, getPosts } from '../hook/postHook'
import { Tag } from '../hook/tagHook'
import { Heritage, heritages } from '../../assets/heritage/heritage'

export interface PostsData {
    posts: Post[]
    page: number
    totalPages: number
    totalPosts: number
}

const ws = new WebSocket('ws://localhost:5001')

// 被 PostList 及其子组件使用
// 储存当前页面的帖子列表与其排序等
export const usePostsStore = defineStore('posts', () => {
    const postsData = ref<PostsData | null>(null)
    const currentPage = ref(0)
    const loaded = ref(false)
    const commentAmounts = ref<Map<Number, Number>>(new Map())
    const latestComments = ref<Map<Number, Comment>>(new Map())
    const watchedTag = ref<Tag | null>(null)
    const selectedHeritagesIds = ref<number[]>([])
    const selectedHeritagesTypes = ref<string[]>([])
    const searchedText = ref("")

    const watchTag = (tag: Tag | null) => {
        watchedTag.value = tag
    }

    const searchText = (content: string) => {
        searchedText.value = content
    }

    // 必须在 PostList 处初始化和卸载
    const load = async () => {
        await loadMorePosts()
            .catch((error: ServerError) => {
                showErrorPopup(error, 2000)
            })
        loaded.value = true
    }

    const unload = () => {
        postsData.value = null
        commentAmounts.value = new Map()
        latestComments.value = new Map()
        currentPage.value = 0
        loaded.value = false
    }

    const reload = async () => {
        unload()
        await load()
    }

    const isLoaded = computed(() =>
        loaded.value
    )

    const loadedPosts = computed(() => {
        return postsData.value?.posts
    })

    const heritageTypeFilter = (types: string[]) => {
        selectedHeritagesTypes.value = types
        selectedHeritagesIds.value = []
    }

    const heritageIdFilter = (ids: number[]) => {
        selectedHeritagesIds.value = ids
        selectedHeritagesTypes.value = []
    }

    const filteredLoadedPosts = computed(() => {
        if (selectedHeritagesIds.value.length > 0) {
            return postsData.value?.posts.filter((post: Post) => {
                return post.heritages.some((id) => selectedHeritagesIds.value.includes(id))
            }).sort((a: Post, b: Post) => {
                const aHasH = a.badges.includes(1)
                const bHasH = b.badges.includes(1)
                if (aHasH && !bHasH) {
                    return -1
                }
                if (!aHasH && bHasH) {
                    return 1
                }
                return 0
            })
        } else if (selectedHeritagesTypes.value.length > 0) {
            return postsData.value?.posts.filter((post: Post) =>
                selectedHeritagesTypes.value.every((type: string) =>
                    heritages.filter((heritage: Heritage) =>
                        post.heritages.some((id: number) =>
                            heritage.id == id)).map((heritage: Heritage) =>
                                heritage.type).includes(type)
                )).sort((a: Post, b: Post) => {
                    const aHasH = a.badges.includes(1)
                    const bHasH = b.badges.includes(1)
                    if (aHasH && !bHasH) {
                        return -1
                    }
                    if (!aHasH && bHasH) {
                        return 1
                    }
                    return 0
                })
        } else {
            return postsData.value?.posts.sort((a: Post, b: Post) => {
                const aHasH = a.badges.includes(1)
                const bHasH = b.badges.includes(1)
                if (aHasH && !bHasH) {
                    return -1
                }
                if (!aHasH && bHasH) {
                    return 1
                }
                return 0
            })
        }
    })

    const commentAmountOf = (id: number) => {
        return commentAmounts.value.get(id)
    }

    const latestCommentOf = (id: number) => {
        return latestComments.value.get(id)
    }

    const loadMorePosts = async (): Promise<void> => {
        currentPage.value++
        await getPosts(true, searchedText.value, watchedTag.value ? watchedTag.value : undefined, currentPage.value, 20)
            .then((newData: PostsData) => {
                if (postsData.value) {
                    postsData.value.totalPosts = newData.totalPosts
                    postsData.value.totalPages = newData.totalPages
                    newData.posts.forEach((newComment: Post) => {
                        postsData.value?.posts.push(newComment)
                    })
                } else {
                    postsData.value = newData
                }
            })
            .catch((error: ServerError) => {
                showErrorPopup(error, 2000)
                throw error
            })

        if (loadedPosts.value) {
            // 维护评论数量
            commentAmounts.value = new Map<number, number>(await Promise.all(
                loadedPosts.value.map(async (post) => {
                    const amount = await getCommentAmount(post.id as number)
                    return [post.id as number, amount] as [number, number]
                })
            ))
            // 维护最新评论
            latestComments.value = new Map<number, Comment>(await Promise.all(
                loadedPosts.value.map(async (post) => {
                    const comment = await getLatestComment(post.id as number)
                    return [post.id as number, comment] as [number, Comment]
                })
            ))
        }
    }

    return {
        currentPage,
        isLoaded,
        loaded,
        watchedTag,
        loadedPosts,
        filteredLoadedPosts,
        selectedHeritagesIds,
        selectedHeritagesTypes,
        searchedText,
        heritageTypeFilter,
        heritageIdFilter,
        searchText,
        reload,
        commentAmountOf,
        latestCommentOf,
        watchTag,
        load,
        unload,
        loadMorePosts,
    }
})