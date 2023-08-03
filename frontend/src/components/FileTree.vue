<!-- TreeView.vue -->
<template>
  <span v-if="isLoading" class="ps-1"><font-awesome-icon icon="fa-solid fa-spinner" class="fa-spin"/></span>
  <ul class="folder">
    <li v-for="node in tree">

      <font-awesome-icon v-if="node.type.toLowerCase()==='dir'" class="pe-1"
                         :icon="'fa-regular ' + (!node.expanded ? 'fa-square-plus':'fa-square-minus')"
                         @click="node.expanded=!node.expanded" role="button"></font-awesome-icon>

      <span class="file" role="button" :class="{'text-muted': !allowFolders &&node.type.toLowerCase()==='dir' }"
            @click="onSelected(node)">
        {{ node.name }}
      </span>
      <FileTree v-if="node.expanded" :path="node.path+'/'+node.name"
                @select="(selectedChild)=>emits('select', selectedChild)"/>
    </li>
  </ul>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import AuthService from "../services/AuthService";
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";


const props = defineProps({
  'path': String,
  'allowFolders': {type: Boolean, default: false}
})

const emits = defineEmits(['select'])

const isLoading = ref(true);
const tree = ref([]);

onMounted(async () => {
  try {
    if (!AuthService.isAuthenticated()) return
    const response = await axios.get(`${window.config.backendUrl}/api/files/${props.path}`)
    tree.value = response.data;
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching tree data:', error);
    isLoading.value = false;
  }
});

const onSelected = (node) => {
  if (node.type.toLowerCase() === 'dir' && !props.allowFolders) {
    node.expanded = !node.expanded;
    return
  }
  emits('select', node);
}

</script>

<style scoped>
ul.folder {
  list-style: none;
}

.file:not(.text-muted):hover {
  background-color: var(--bs-secondary-bg);
}
</style>
