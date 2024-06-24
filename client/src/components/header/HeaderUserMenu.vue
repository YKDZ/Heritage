<script setup lang="ts">
import { useUserStore } from '../../api/store/user';

const auth = useUserStore()
</script>

<template>
    <VDropdown>
        <RouterLink :to="`/profile/${auth.user?.id}`">{{ auth.user?.name }}</RouterLink>
        <!-- <template #popper>
            <div class="flex flex-col justify-center items-center gap-y-1">
                <RouterLink :to="`/profile/${auth.user?.id}`">账号信息</RouterLink>
            </div>
        </template> -->
    </VDropdown>
</template>