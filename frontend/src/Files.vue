<template>
  <div>
    <div><!-- header start -->
      <div class="pb-4 float-start">
        <div v-for="(folder, index) in currentPath" class="d-inline-block">
          <font-awesome-icon v-if="index!==0" class="fa-2xs text-black-50 opacity-25 ps-2 pe-2 align-middle"
                             icon="fa-angle-right"></font-awesome-icon>
          <router-link :to="`/files/${currentPath.slice(0,index+1).join('/')}`" class="text-decoration-none">
            <font-awesome-icon v-if="index===0" class="pe-1" icon="fa-home"></font-awesome-icon>
            <span v-if="index===0">Home</span><span v-else>{{ folder }}</span>
          </router-link>
        </div>
      </div>
      <div class="float-end">
        <label class="btn btn-primary btn-sm me-2" for="inputFile" role="button">
          <font-awesome-icon icon="fa-solid fa-file-circle-plus"></font-awesome-icon>
          Upload File</label> <input id="inputFile" hidden="hidden" multiple type="file"
                                     @change.stop="(e) => uploadFiles(e.target.files)"> <label
        class="btn btn-primary btn-sm me-2" for="inputFolder" role="button">
        <font-awesome-icon icon="fa-solid fa-folder-plus"></font-awesome-icon>
        Upload Folder</label> <input id="inputFolder" directory hidden="hidden" mozdirectory msdirectory
                                     multiple="multiple" odirectory type="file" webkitdirectory
                                     @change.stop="(e) => uploadFiles(e.target.files, true)">
        <button class="btn btn-secondary btn-sm me-2" data-bs-target="#transferHelpModal" data-bs-toggle="modal">
          <font-awesome-icon icon="fa-solid fa-upload"></font-awesome-icon>
          FTP/Aspera
        </button>
      </div>
    </div> <!-- header end-->

    <div class="table-responsive-sm">
      <table v-if="files?.length" class="table table-sm align-middle  table-hover">
        <thead>
        <tr>
          <th class="text-end"></th>
          <th role="button" @click.prevent="flipSort('name')">Name
            <font-awesome-icon :class="{'grayed': sortKey!=='name'}" :icon="sorterIcon('name')"
                               class="fa-sm"></font-awesome-icon>
          </th>
          <th class="text-end pe-4" role="button" @click.prevent="flipSort('size')">Size (in bytes)
            <font-awesome-icon :class="{'grayed': sortKey!=='size'}" :icon="sorterIcon('size')"
                               class="fa-sm"></font-awesome-icon>
          </th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="file in sortedFiles">
          <td class="text-end pointer">
            <font-awesome-icon v-if="file.type.toLowerCase()==='dir'" class="fa-sm text-primary"
                               icon="fa-solid fa-folder"
                               @click.stop="navigate(file.path, file.name)"></font-awesome-icon>
          </td>
          <td><a v-if="file.type.toLowerCase()==='dir'" class="pointer"
                 @click.stop="navigate(file.path, file.name)">{{ file.name }}</a> <span v-else>{{ file.name }}</span>
          </td>
          <td class="text-end pe-4"><span v-if="file.type.toLowerCase()!=='dir'">{{ file.size.toLocaleString() }}</span>
          </td>
          <td>
            <div class="btn-group">
              <font-awesome-icon v-if="file.type.toLowerCase()!=='dir'" class="fa-fw btn btn-link text-primary"
                                 icon="fa-download" title="Download"
                                 @click.stop="downloadFile(file)"></font-awesome-icon>
              <font-awesome-icon v-else class="fa-fw btn btn-link text-primary" icon="fa-regular fa-file-lines"
                                 title="Download File List"
                                 @click.stop="downloadFileList(file)"></font-awesome-icon>
              <font-awesome-icon class="fa-fw btn btn-link text-danger" icon="fa-regular fa-trash-can" title="Delete"
                                 @click.stop="deleteFile(file)"></font-awesome-icon>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Upload Modal -->
    <div id="uploadModal" aria-hidden="true" class="modal fade" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">Upload Files</h1>
          </div>
          <div class="modal-body">
            <div class="text-center pb-2">{{ currentUpload.progress === 100 ? 'Saving' : 'Uploading' }}
              {{ currentUpload.name }} ...
            </div>
            <div aria-label="Example with label" aria-valuemax="100" aria-valuemin="0"
                 aria-valuenow="{{currentUpload.progress}}" class="progress" role="progressbar">
              <div :class="{ 'progress-bar-striped  progress-bar-animated': currentUpload.progress===100}"
                   :style="{width: currentUpload.progress+'%'}" class="progress-bar">{{ currentUpload.progress }}%
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-danger" data-bs-dismiss="modal" type="button"
                    @click.stop="axiosAbortController.abort()">Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <TransferHelpModal></TransferHelpModal>

  </div>
</template>

<script setup>
import router from './router';
import AuthService from './services/AuthService';
import { computed, createApp, ref, watchEffect } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import utils from './utils.js';
import axios from 'axios';
import { Modal } from 'bootstrap';
import TransferHelpModal from './components/TransferHelpModal.vue';


const props = defineProps(['paths']);
const files = ref([]);
const currentUpload = ref({ name: '', progress: 0 });
const sortKey = ref('size');
const sortDirection = ref(1);

const axiosAbortController = new AbortController();
//TODO: Get these constants from config
const MAX_UPLOAD_SIZE = 1024;// in MBs;
const MAX_UPLOAD_FILE_COUNT = 1000;

const currentPath = computed(() => props.paths === '' ? ['user'] : props.paths);
const sortedFiles = computed(() => files.value?.sort((a, b) => // sort on type before name
  sortDirection.value * (sortKey.value === 'name' ? `${a?.type}-${a?.name}`.localeCompare(`${b?.type}-${b?.name}`)
    : (a?.type === 'DIR' ? -1 : a?.size) - (b?.type === 'DIR' ? -1 : b?.size)),
));


const sorterIcon = (key) => sortKey.value === key ? sortDirection.value === 1 ? 'fa-sort-up' : 'fa-sort-down' : 'fa-sort';
const flipSort = (key) => {
  if (sortKey.value === key) {
    sortDirection.value *= -1;
  } else {
    sortKey.value = key;
    sortDirection.value = 1;
  }
};

watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return;
  const path = props.paths && props.paths !== '' ? props.paths.map(path => encodeURIComponent(path)).join('/') : 'user/';
  const response = await axios.get(`${window.config.backendUrl}/api/files/${path}`)
    .then(response => files.value = response.data);
});

const navigate = async (path, name) => {
  path = path.split('/').map(path => encodeURIComponent(path)).join('/');
  if (`${path}/${name}` === currentPath.value.join('/') + '/') {
    location.reload();
  } else {
    await router.push(`/files/${path}/${name}`);
  }
};

const downloadFile = (file) => {
  const downloadPath = `${window.config.backendUrl}/api/files/${file.path}?fileName=${file.name}`;
  axios({ url: downloadPath, responseType: 'blob' }).then((response) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(response.data);
    a.setAttribute('download', file.name);
    a.click();
  });
};

const downloadFileList = (file) => {
  const downloadPath = `${window.config.backendUrl}/filelist/${file.path}/${file.name}`;
  axios({ url: downloadPath, responseType: 'blob' }).then((response) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(response.data);
    a.setAttribute('download', file.name + '.tsv');
    a.click();
  });
};

const deleteFile = async (file) => {
  if (!await utils.confirm('Delete File', `Do you want to delete ${file.name}?`, 'Delete')) return;
  const downloadPath = `${window.config.backendUrl}/api/files/${file.path}?fileName=${file.name}`;
  axios.delete(downloadPath).then(async () => await navigate(file.path, ''));
};

const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('files', file);
  return axios.post(`${window.config.backendUrl}/api/files/${currentPath.value.join('/')}`,
    formData,
    {
      signal: axiosAbortController.signal,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: function(progressEvent) {
        currentUpload.value.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      }.bind(this),
    });
};

const uploadFiles = async (uploads, isFolderUpload) => {

  const filesToUpload = Array.from(uploads);
  // warn when files are large or more than a threshold
  const largeFiles = filesToUpload.filter(file => file.size / (1024 * 1024) > MAX_UPLOAD_SIZE);
  if (largeFiles.length > 0 || filesToUpload.length > MAX_UPLOAD_FILE_COUNT) {
    const proceed = await utils.confirm(
      `Upload warning`,
      `For uploading larger than ${MAX_UPLOAD_SIZE} MB or more than ${MAX_UPLOAD_FILE_COUNT} files, using FTP/Aspera is recommended. Do you still want to continue?`,
      `Yes`, false, true, 'No, cancel');
    if (!proceed) return;
  }

  // warn overwrite
  const fileNames = files.value.map(f => f.name);
  const overlap = filesToUpload.map(file => isFolderUpload
    ? file?.webkitRelativePath.substring(0, file?.webkitRelativePath.indexOf('/'))
    : file.name)
    .filter(name => fileNames.includes(name));

  if (overlap.length > 0) {
    const overlapString = overlap.length === 1 ? overlap[0] + '?' : overlap.length + ' files? (' + overlap.join(', ') + ')';
    const proceed = await utils.confirm(
      `Overwrite files?`,
      isFolderUpload
        ? 'This may overwrite existing files in the folder. Do you want to go ahead?'
        : `Do you want to overwrite ${overlapString}`,
      `Yes, overwrite`, false, true, 'No, cancel');
    if (!proceed) return;
  }

  const uploadModal = new Modal('#uploadModal');
  uploadModal.show();

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    currentUpload.value.name = file.name;
    await uploadFile(file)
      .then((r) => {
        if (r?.message === 'canceled') i = filesToUpload.length;
      })
      .catch((e) => {
        console.log(e);
      });
  }
  location.reload();
  return false;
};

</script>


<style>
.pointer {
  cursor: pointer;
  text-decoration: none;
}

.grayed {
  color: #cccccc;
}
</style>
