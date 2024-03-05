<template>
  <span v-if="isLoading" class="ps-1"><font-awesome-icon icon="fa-solid fa-spinner" class="fa-spin"/></span>
      <ul class="folder">
        <li v-for="node in tree" :key="node.name">
          <font-awesome-icon
            v-if="node.type.toLowerCase() === 'dir'"
            class="pe-1"
            :icon="'fa-regular ' + (!node.expanded ? 'fa-square-plus':'fa-square-minus')"
            @click="node.expanded = !node.expanded"
            role="button"
          ></font-awesome-icon>
          <span
            class="file"
            role="button"
            :class="{'text-muted': !allowFolders && node.type.toLowerCase() === 'dir' }"
            @click="onSelected(node)"
          >
            {{ node.name }}
          </span>
          <FileTree
            v-if="node.expanded"
            :path="node.path + '/' + node.name"
            :allowFolders="allowFolders"
            @select="onChildSelected"
          />
        </li>
      </ul>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import AuthService from "../services/AuthService";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import FileTree from "./FileTree.vue";

const props = defineProps({
  path: String,
  allowFolders: { type: Boolean, default: false }
});

const emit = defineEmits(['select']);

const isLoading = ref(true);
const tree = ref([]);

const show = async () => {
  try {
    if (!AuthService.isAuthenticated()) return;
    const response = await axios.get(`${window.config.backendUrl}/api/files/${props.path}`);
    tree.value = response.data;
  } catch (error) {
    console.error('Error fetching tree data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(show);
defineExpose({ show});


const onSelected = (node) => {
  if (node.type.toLowerCase() === 'dir' && !props.allowFolders) {
    node.expanded = !node.expanded;
    return;
  }
  emit('select', node);
};

const onChildSelected = (selectedChild) => {
  emit('select', selectedChild);
};
</script>

<style scoped>
ul.folder {
  list-style: none;
}

.file:not(.text-muted):hover {
  background-color: var(--bs-secondary-bg);
}
</style>
