<script setup lang="ts">
import { Ref, computed, inject } from 'vue';
import { User, useUserStore } from '../../api/store/user';
import { userKey } from '../../api/keys/user';
import { ProfileContnet, useProfileStore } from '../../api/store/profile';

const user = inject<Ref<User>>(userKey)
const auth = useUserStore()
const profile = useProfileStore()

const isSelf = computed(() => {
    if (user && user.value)
        return user.value.id == auth.user?.id
})
</script>

<template>
    <div class="flex flex-col gap-3 text-slate-600 items-start w-fit text-sm">
        <span @click="profile.viewProfileContent(ProfileContnet.POST_HISTORY)"
            class="cursor-pointer hover:text-slate-800"
            :class="{ 'text-slate-800': profile.viewedProfileContent == ProfileContnet.POST_HISTORY }">
            <font-awesome-icon :icon="['fas', 'list']" class="w-4 mr-1" />
            帖子
        </span>
        <span @click="profile.viewProfileContent(ProfileContnet.VIEW_HISTORY)" v-if="isSelf"
            class="cursor-pointer hover:text-slate-800"
            :class="{ 'text-slate-800': profile.viewedProfileContent == ProfileContnet.VIEW_HISTORY }">
            <font-awesome-icon :icon="['fas', 'eye']" class="w-4 mr-1" />
            浏览
        </span>
        <span @click="profile.viewProfileContent(ProfileContnet.SECURITY)" v-if="isSelf"
            class="cursor-pointer hover:text-slate-800"
            :class="{ 'text-slate-800': profile.viewedProfileContent == ProfileContnet.SECURITY }">
            <font-awesome-icon :icon="['fas', 'shield']" class="w-4 mr-1" />
            安全
        </span>
    </div>
</template>