<script setup>

import FileFolderSelectModal from "./components/FileFolderSelectModal.vue";
import {ref} from "vue";

const attr = {path:'/user/structures.svg'};
const filePath = ref(attr.path)
</script>

<template>
Help

  [{{attr}}]
  <p><FileFolderSelectModal :attribute="attr" /></p>
</template>

<style scoped>

</style>
