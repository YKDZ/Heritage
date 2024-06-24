<script setup lang="ts">
import HomeBannerView from './HomeBannerView.vue';
import HomePostListView from './HomePostListView.vue';
import { useProfileStore } from '../../api/store/profile';
import { nextTick, ref } from 'vue';

const profile = useProfileStore()

const handleWheel = async (ev: WheelEvent) => {
    if (ev.deltaY > 0 && !profile.isViewingPost) {
        profile.toPostList()
        await nextTick()
        window.scrollTo(0, 0)
    }
}

const lastScroll = ref(0)

const handleScroll = async (ev: Event) => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    if (scrollTop > lastScroll.value && !profile.isViewingPost) {
        profile.toPostList()
        await nextTick()
        window.scrollTo(0, 0)
    }
    lastScroll.value = scrollTop <= 0 ? 0 : scrollTop
}

onwheel = handleWheel

onscroll = handleScroll
</script>

<template>
    <Header />
    <div class="w-full" :class="{ 'overflow-hidden': !profile.isViewingPost }">
        <div class="transition-all duration-700 overflow-hidden"
            :class="{ 'max-h-0': profile.isViewingPost, 'max-h-screen': !profile.isViewingPost }">
            <HomeBannerView />
        </div>
        <div class="transition-all duration-700"
            :class="{ 'translate-y-0': profile.isViewingPost, 'translate-y-full': !profile.isViewingPost }">
            <HomePostListView />
            <Footer />
        </div>
    </div>
</template>