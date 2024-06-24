<script setup lang="ts">
import { Ref, defineAsyncComponent, provide, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { getUser } from '../../api/hook/userHook'
import { userKey } from '../../api/keys/user'
import { User, useUserStore } from '../../api/store/user'
import router from '../../router/router'
import { ServerError } from '../../utils/ServerError'
import ProfileBanner from '../profile/ProfileBanner.vue'
import { PopupType, showPopup } from '../utils/Popup.vue'
import ProfileSidebar from '../profile/ProfileSidebar.vue'
import { ProfileContnet, useProfileStore } from '../../api/store/profile'
import ProfileSecurity from '../profile/ProfileSecurity.vue'

const ProfilePostHistory = defineAsyncComponent(() =>
    import('../profile/ProfilePostHistory.vue')
)
const ProfileViewHistory = defineAsyncComponent(() =>
    import('../profile/ProfileViewHistory.vue')
)

const auth = useUserStore()
const profile = useProfileStore()
const route = useRoute()
const id = ref("")
const user = ref<User>()

watchEffect(() => {
    provide(userKey, user as Ref<User>)
})

watchEffect(async () => {
    id.value = route.params.id.toString()
    await getUser(id.value)
        .then((fetched: User) => {
            user.value = fetched
        })
        .catch((error: ServerError) => {
            showPopup(error.message, 2000, PopupType.ERROR)
        })
    if (!user.value) {
        showPopup("你寻找的用户主页不存在。正在转到个人主页...", 2000, PopupType.ERROR)
        router.push(`/profile/${auth.user?.id}`)
        return
    }
})
</script>

<template>
    <Header />
    <div class="min-h-screen">
        <ProfileBanner />
        <div class="mt-8 grid grid-cols-6 gap-x-10 gap-y-2">
            <div class="col-start-2 col-span-3">
                <ProfilePostHistory v-if="profile.viewedProfileContent == ProfileContnet.POST_HISTORY" />
                <ProfileCommentHistory v-if="profile.viewedProfileContent == ProfileContnet.COMMENT_HISTORY" />
                <ProfileViewHistory v-if="profile.viewedProfileContent == ProfileContnet.VIEW_HISTORY" />
                <ProfileSecurity v-if="profile.viewedProfileContent == ProfileContnet.SECURITY" />
            </div>
            <div class="col-start-5">
                <ProfileSidebar />
            </div>
        </div>
    </div>
    <Footer />
</template>