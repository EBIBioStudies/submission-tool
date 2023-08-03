<template>
  <div>
    <div><!-- header start -->
      <div class="pb-4 float-start">
        <div class="d-inline-block" v-for="(folder, index) in currentPath">
          <font-awesome-icon v-if="index!==0" icon="fa-angle-right"
                             class="fa-2xs text-black-50 opacity-25 ps-2 pe-2 align-middle"></font-awesome-icon>
          <router-link class="text-decoration-none" :to="`/files/${currentPath.slice(0,index+1).join('/')}`">
            <font-awesome-icon v-if="index===0" icon="fa-home" class="pe-1"></font-awesome-icon>
            <span v-if="index===0">Home</span><span v-else>{{ folder }}</span>
          </router-link>
        </div>
      </div>
      <div class="float-end">
        <label role="button" class="btn btn-primary btn-sm me-2" for="inputFile">
          <font-awesome-icon icon="fa-solid fa-file-circle-plus"></font-awesome-icon>
          Upload File</label>
        <input type="file" id="inputFile" multiple hidden="hidden" @change.stop="(e) => uploadFiles(e.target.files)">
        <label role="button" class="btn btn-primary btn-sm me-2" for="inputFolder">
          <font-awesome-icon icon="fa-solid fa-folder-plus"></font-awesome-icon>
          Upload Folder</label>
        <input type="file" id="inputFolder" multiple="multiple"
               webkitdirectory mozdirectory msdirectory odirectory directory hidden="hidden"
               @change.stop="(e) => uploadFiles(e.target.files)">
        <button class="btn btn-secondary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#transferModal">
          <font-awesome-icon icon="fa-solid fa-upload"></font-awesome-icon>
          FTP/Aspera
        </button>
      </div>
    </div> <!-- header end-->

    <div class="table-responsive-sm">
      <table v-if="files?.length" class="table table-sm align-middle  table-hover">
        <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th class="text-end pe-4">Size (in bytes)</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="file in sortedFiles">
          <td class="text-end pointer">
            <font-awesome-icon @click.stop="navigate(file.path, file.name)" icon="fa-solid fa-folder"
                               class="fa-sm text-primary"
                               v-if="file.type.toLowerCase()==='dir'"
            ></font-awesome-icon>
          </td>
          <td><a class="pointer" v-if="file.type.toLowerCase()==='dir'"
                 @click.stop="navigate(file.path, file.name)">{{ file.name }}</a>
            <span v-else>{{ file.name }}</span></td>
          <td class="text-end pe-4"><span v-if="file.type.toLowerCase()!=='dir'">{{ file.size.toLocaleString() }}</span></td>
          <td>
            <div class="btn-group">
              <button v-if="file.type.toLowerCase()!=='dir'" class="btn btn-link text-primary"
                      @click.stop="downloadFile(file)">
                <font-awesome-icon icon="fa-download"></font-awesome-icon>
              </button>
              <button v-else class="btn btn-link text-primary" @click.stop="downloadFileList(file)">
                <font-awesome-icon icon="fa-regular fa-file-lines"></font-awesome-icon>
              </button>
              <button class="btn btn-link text-danger" @click.stop="deleteFile(file)">
                <font-awesome-icon icon="fa-regular fa-trash-can"></font-awesome-icon>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="uploadModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">Upload Files</h1>
          </div>
          <div class="modal-body">
            <div class="text-center pb-2">{{ currentUpload.progress === 100 ? "Saving" : "Uploading" }}
              {{ currentUpload.name }} ...
            </div>
            <div class="progress" role="progressbar" aria-label="Example with label"
                 aria-valuenow="{{currentUpload.progress}}" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar"
                   :class="{ 'progress-bar-striped  progress-bar-animated': currentUpload.progress===100}"
                   :style="{width: currentUpload.progress+'%'}">{{ currentUpload.progress }}%
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" @click.stop="axiosAbortController.abort()"
                    data-bs-dismiss="modal">Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <TransferModal></TransferModal>

  </div>
</template>

<script setup>
import router from './router';
import AuthService from "./services/AuthService";
import {computed, ref, watchEffect} from 'vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import utils from './utils.js'
import axios from "axios";
import {Modal} from "bootstrap";
import TransferModal from "./components/TransferModal.vue";
import FileTree from "./components/FileTree.vue";

const props = defineProps(['paths']);
const currentPath = computed(() => props.paths === '' ? ['user'] : props.paths)
const sort = ref('type')
const files = ref([])
const currentUpload = ref({name: '', progress: 0})
const sortedFiles = computed(() => files.value?.sort((a, b) => {
  return a[sort.value].localeCompare(b[sort.value]);
}))
const axiosAbortController = new AbortController();

const showModal = ref(true)

watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return
  const path = props.paths && props.paths !== '' ? props.paths.join('/') : 'user/'
  const response = await axios.get(`${window.config.backendUrl}/api/files/${path}`)
    .then(response => files.value = response.data)
})

const navigate = async (path, name) => {
  await router.push(`/files/${path}/${name}`)
  location.reload()
}

const downloadFile = (file) => {
  const downloadPath = `${window.config.backendUrl}/api/files/${file.path}?fileName=${file.name}`;
  axios({url: downloadPath, responseType: 'blob'}).then((response) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(response.data);
    a.setAttribute("download", file.name);
    a.click();
  });
}

const downloadFileList = (file) => {
  const downloadPath = `${window.config.backendUrl}/filelist/${file.path}/${file.name}`;
  axios({url: downloadPath, responseType: 'blob'}).then((response) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(response.data);
    a.setAttribute("download", file.name + ".tsv");
    a.click();
  });
}

const deleteFile = async (file) => {
  if (!await utils.confirm("Delete File", `Do you want to delete ${file.name}?`, "Delete")) return
  const downloadPath = `${window.config.backendUrl}/api/files/${file.path}?fileName=${file.name}`;
  axios.delete(downloadPath).then(async () => await navigate(file.path, ''));
}

const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('files', file);
  return axios.post(`${window.config.backendUrl}/api/files/${currentPath.value.join("/")}`,
    formData,
    {
      signal: axiosAbortController.signal,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: function (progressEvent) {
        currentUpload.value.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      }.bind(this)
    })
}

const uploadFiles = async (files) => {
  const uploadModal = new Modal('#uploadModal');
  uploadModal.show();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    currentUpload.value.name = file.name
    await uploadFile(file)
      .then((r) => {
        if (r?.message === 'canceled') i = files.length;
      })
      .catch((e) => {
        console.log(e);
      })
  }
  uploadModal.hide();
  location.reload()
  return false
}

</script>


<style>
.pointer {
  cursor: pointer;
  text-decoration: none;
}
</style>
