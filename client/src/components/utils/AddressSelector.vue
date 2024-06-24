<script setup lang="ts">
import { Ref, ref, watch, watchEffect } from 'vue'
import { provinces } from '../../assets/regions/province'
import { City, cities } from '../../assets/regions/city'
import { Country, countries } from '../../assets/regions/country'
import { Address } from '../../api/misc/address';

const address = defineModel<Address>({ required: true })

const availableCities: Ref<City[]> = ref([])
const availableCountries: Ref<Country[]> = ref([])

watch(() => address.value.province, (newProvince) => {
    address.value.city = ''
    address.value.country = ''
    availableCities.value = cities[newProvince] || []
    availableCountries.value = []
})

watch(() => address.value.city, (newCity) => {
    address.value.country = ''
    availableCountries.value = countries[newCity] || []
})

watchEffect(() => {
    availableCities.value = cities[address.value.province]
    availableCountries.value = countries[address.value.city]
})
</script>

<template>
    <label>省</label>
    <select v-model="address.province">
        <option value="" disabled>请选择省</option>
        <option v-for="province in provinces" :key="province.id" :value="province.id">{{ province.name }}</option>
    </select>
    <label>市</label>
    <select v-model="address.city">
        <option value="" disabled>请选择市</option>
        <option v-for="city in availableCities" :key="city.id" :value="city.id">{{ city.name }}</option>
    </select>
    <label>区县</label>
    <select v-model="address.country">
        <option value="" disabled>请选择区县</option>
        <option v-for="country in availableCountries" :key="country.id" :value="country.id">{{ country.name }}
        </option>
    </select>
    <input v-model="address.detail">
</template>