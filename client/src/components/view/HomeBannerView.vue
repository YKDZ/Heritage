<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { bannerConfigs } from '../../assets/banner/config';
import { useProfileStore } from '../../api/store/profile';

const profile = useProfileStore()
</script>

<template>
    <div class="w-full bg-transparent">
        <swiper-container :lazy="true" :slides-per-view="1" :autoplay="{ delay: 8000, disableOnInteraction: false }"
            :loop="true" :centered-slides="true" :pagination="{ clickable: true }">
            <swiper-slide v-for="banner in bannerConfigs">
                <RouterLink :to="{ name: `PostView`, params: { id: banner.linkedPostId } }">
                    <img :src="banner.imgURL" class="w-full h-screen object-cover">
                </RouterLink>
            </swiper-slide>
        </swiper-container>
    </div>
</template>