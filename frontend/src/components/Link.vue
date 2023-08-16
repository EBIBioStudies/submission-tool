<script setup>
import {ref} from "vue";

const props = defineProps(['fieldType','link', 'class', 'placeholder'])
const emits = defineEmits(['change'])
const thisLink = ref(props.link)
</script>

<template>
  <input
    type="text"
    class="form-control text-primary form-control-sm"
    :class="props?.class"
    :placeholder="props?.placeholder"
    v-model="thisLink.url"
  />
</template>

<style scoped>

</style>
