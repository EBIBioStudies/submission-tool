<script setup lang="ts">

import { ComponentPublicInstance, computed, getCurrentInstance, inject, onMounted, ref } from 'vue';
import FileTree from './FileTree.vue';
import { Modal } from 'bootstrap';
import axios, { AxiosProgressEvent } from 'axios';
import { useRoute } from 'vue-router';
import { PageTab } from '@/models/PageTab.model.ts';
import type { Node } from '@/models/FileTreeNode.model.ts';
import utils from '@/utils.ts';

const props = defineProps<{
  file: PageTab.File | PageTab.Attribute,
  class?: string,
  allowFolder?: boolean,
  isFileList?: boolean,
  row?: PageTab.File
}>();
const emits = defineEmits<{ select: [PageTab.File | PageTab.Attribute] }>();
const thisFile = ref(props.file);
const isFileList = ref(props.isFileList);
if (isFileList.value === undefined && (thisFile.value as PageTab.Attribute)?.name === 'File List') {
  isFileList.value = true;
}
const allowFolder = !isFileList.value;
const axiosAbortController = new AbortController();
const currentUpload = ref({ name: '', progress: 0 });
const showProgressbar = ref(false);
const MAX_UPLOAD_SIZE = 1024; //1GB
const errorMessage = ref('');
const route = useRoute();
const parentDisplayType = inject('parentDisplayType');


const isAFileList = (_file: PageTab.File | PageTab.Attribute): _file is PageTab.Attribute => isFileList.value;

defineExpose({ errorMessage });

let modal: Modal | null = null;
const thisComponent = getCurrentInstance();
const filetree = ref<ComponentPublicInstance<typeof FileTree>>();
onMounted(() => {
  let elementById = document.getElementById('fileFolderSelectModal' + thisComponent!.uid);
  if (elementById)
    modal = new Modal(elementById, {
      backdrop: 'static',
    });
});

const uploadFile = async (file: File) => {
  if (file.size > MAX_UPLOAD_SIZE * 1024 * 1024) { // Check if file size is greater than 1GB
    const proceed = await utils.confirm(
      `Upload warning`,
      `For uploading larger than ${MAX_UPLOAD_SIZE} MB, using FTP/Aspera is recommended. Do you still want to continue?`,
      { okayLabel: `Yes`, cancelLabel: 'No, cancel' });
    if (!proceed) return;
  }
  const formData = new FormData();
  formData.append('files', file);
  showProgressbar.value = true;
  try {
    await axios.post(`/api/files/user/`, formData, {
      signal: axiosAbortController.signal,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: function(progressEvent: AxiosProgressEvent) {
        const progress = Math.round((progressEvent.loaded / progressEvent.total!) * 100);
        currentUpload.value.progress = progress;

        if (progress === 100) {
          // Wait a bit for the backend to process the file after it's fully uploaded
          setTimeout(() => {
            if (modal) {
              modal.hide(); // Hide the modal when upload is complete
            }
          }, 500); // Adjust the timeout as necessary
        }
      },
    });
    filetree.value?.show(); // Assuming refreshTree is a method in FileTree
    //We are reusing this component for file and file list selection. File is using path in pagetab but FileList use value
    //this line is trying to set correct pageTab variable based on component usage
    isAFileList(thisFile.value) ? thisFile.value.value = file.name : thisFile.value.path = file.name; // Update the input box with the file name
    if (isFileList.value) {
      await validateFileListFile(file.name);
    }
  } catch (error) {
    console.error('File upload error:', error);
  } finally {
    showProgressbar.value = false;
    currentUpload.value.progress = 0;
  }
};

const validateFileListFile = async (fileName: string) => {
  errorMessage.value = '';
  const formData = new FormData();
  const pathArray = route.path.split('/');
  const acc = pathArray[pathArray.length - 1];
  formData.append('accNo', acc);
  formData.append('fileListName', fileName);

  try {
    await axios.post(`/api/submissions/fileLists/validate`, formData);
  } catch (error: any) {
    errorMessage.value = 'File list is not valid. ' + (error?.response?.data?.log?.message || '').substring(0, 200);
    isAFileList(thisFile.value) ? thisFile.value.value = '' : thisFile.value.path = '';
  }
};


const select = async (node: Node) => {
  modal?.hide();

  // ✅ Use pre-computed normalized path from FileTree
  const path = node.selectedPath ?? (node.path + '/' + node.name);

  if (isAFileList(thisFile.value)) {
    thisFile.value.value = path;
  } else {
    thisFile.value.path = path;
  }

  emits('select', thisFile.value);

  if (isFileList.value) {
    await validateFileListFile(path);
  }
};


const fileModalModel = computed({
  get: () => {
    return isAFileList(thisFile.value) ? thisFile.value.value! : thisFile.value.path;
  },
  set: (newValue) => {
    if (isAFileList(thisFile.value)) {
      thisFile.value.value = newValue;
    } else {
      thisFile.value.path = newValue;
    }
  },
});

const loadTree = () => filetree.value?.show();
</script>

<template>
  <div class="form-control">
    <div class="input-group input-group-sm" :class="props.class">
      <input type="text" class="form-control bg-body-secondary" v-model="fileModalModel" readonly data-bs-toggle="modal"
             :disabled="parentDisplayType==='readonly'"

             :data-bs-target="'#fileFolderSelectModal'+thisComponent!.uid"
             @click="loadTree()" :class="{'is-invalid': errorMessage}">
      <button class="btn btn-secondary" type="button" data-bs-toggle="modal"
              @click="loadTree()"
              :disabled="parentDisplayType==='readonly'"
              :data-bs-target="'#fileFolderSelectModal'+thisComponent!.uid">
        Select File
      </button>
      <div v-if="errorMessage" class="invalid-feedback">{{ errorMessage }}</div>
    </div>
  </div>
  <div class="modal fade" :id="'fileFolderSelectModal'+thisComponent!.uid" tabindex="-1"
       aria-labelledby="fileFolderSelectModal"
       aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Select or upload file</h4>
          <button type="button" data-bs-dismiss="modal" class="btn-close">
          </button>
        </div>
        <div class="modal-body">
          <h5>Select file{{ allowFolder ? ' / folder' : '' }}</h5>
          <div class="card bg-light mb-3">
            <div class="card-body overflow-auto" style="max-height: 400px;">
              <FileTree path="" ref="filetree" :allowFolders="allowFolder"
                        @select="(node:Node) => select(node)" />
            </div>
          </div>
          <h5>Upload File</h5>
          <div class="input-group">
            <div class="custom-file">
              <input id="inputGroupFile" type="file" class="custom-file-input"
                     @change="uploadFile(($event.target as HTMLInputElement).files![0])">
              <label for="inputGroupFile" class="custom-file-label"> Select file to upload </label>
            </div>
          </div>
          <div v-if="showProgressbar">
            <div class="text-center pb-2">{{ currentUpload.progress === 100 ? 'Saving' : 'Uploading' }}
              {{ currentUpload.name }} ...
            </div>
            <div class="progress" aria-label="Example with label" role="progressbar" aria-valuemin="0"
                 aria-valuemax="100" :aria-valuenow="currentUpload.progress">
              <div class="progress-bar"
                   :class="{'progress-bar-striped progress-bar-animated': currentUpload.progress === 100}"
                   :style="{width: currentUpload.progress + '%'}"></div>
            </div>
            <div class="text-center">{{ currentUpload.progress }}%</div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" :id="'fileFolderSelectModal'+thisComponent!.uid" class="btn btn-outline-secondary"
                  data-bs-dismiss="modal" @click.stop="axiosAbortController.abort()">Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.input-group > .custom-file {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.custom-file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0; /* Keep input invisible but make the label clickable across the entire element */
  cursor: pointer; /* Indicate the label is clickable */
}

.custom-file-label {
  width: 100%;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  color: #495057;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.custom-file-label:after {
  content: "Browse";
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  color: #495057;
  background-color: #e9ecef;
  border-left: 1px solid #ced4da;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}
</style>
