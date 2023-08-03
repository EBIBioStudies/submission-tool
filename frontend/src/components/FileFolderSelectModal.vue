<script setup>

import {getCurrentInstance, onMounted, ref} from "vue";
import FileTree from "./FileTree.vue";
import {Modal} from "bootstrap";

const props = defineProps(['file'])
const emits = defineEmits(['select'])

const thisFile = ref(props.file);
let modal = null;
const thisComponent = getCurrentInstance();

onMounted(() => {
  modal = new Modal(document.getElementById('fileFolderSelectModal'+thisComponent.uid), {
    backdrop: 'static'
  })
})
const select = (node) => {
  modal.hide();
  thisFile.value.path = (node.path + '/' + node.name).substring(5);
  emits('select', thisFile.value);
}

</script>

<template>
  <div class="input-group input-group-sm">
    <input type="text" class="form-control bg-body-secondary" v-model="thisFile.path" readonly data-bs-toggle="modal"
           :data-bs-target="'#fileFolderSelectModal'+thisComponent.uid">
    <button class="btn btn-secondary" type="button" data-bs-toggle="modal" :data-bs-target="'#fileFolderSelectModal'+thisComponent.uid">
      Select File
    </button>
  </div>
  <div class="modal fade" :id="'fileFolderSelectModal'+thisComponent.uid" tabindex="-1" aria-labelledby="fileFolderSelectModal"
       aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Select File: {{thisFile?.path}}</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="overflow-auto" style="max-height: 400px">
            <FileTree path="/user"
                      @select="(node) => select(node)"/>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" :id="'fileFolderSelectModal'+thisComponent.uid" class="btn btn-outline-secondary"
                  data-bs-dismiss="modal">Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
