<script setup lang="ts">
import { computed } from 'vue';
import { cities } from '../../assets/regions/city';
import { countries } from '../../assets/regions/country';
import { provinces } from '../../assets/regions/province';
import { Address } from '../../api/misc/address';

const props = defineProps<{
    address: Address
}>()

const renderedAddress = computed(() => {
    const address = props.address
    if (!address || !address.province || !address.city || !address.country || !address.detail) {
        return "地址未指定"
    }
    const provinceName: string = provinces.find((province) => province.id == address.province)?.name as string
    const cityName: string = cities[address.province].find((city) => city.id == address.city)?.name as string
    const countryName: string = countries[address.city].find((country) => country.id == address.country)?.name as string
    return `${provinceName} ${cityName} ${countryName} ${address.detail}`
})
</script>

<template>
    <p>{{ renderedAddress }}</p>
</template>