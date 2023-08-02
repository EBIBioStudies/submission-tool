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
        <label role="button" class="btn btn-primary me-2" for="inputFile">Upload File</label>
        <input type="file" id="inputFile" multiple hidden="hidden"
               @input.stop="(e) => uploadFiles(e.target.files)">
        <label role="button" class="btn btn-primary" for="inputFile">Upload Folder</label>
        <input type="file" id="inputFile" multiple webkitdirectory directory hidden="hidden"
               @select="(e) => uploadFiles(e.target.files)">
      </div>
    </div> <!-- header end-->

    <div class="table-responsive-sm">
      <table v-if="files?.length" class="table table-sm align-middle  table-hover">
        <thead>
        <th></th>
        <th>Name</th>
        <th class="text-end pe-4">Size (in bytes)</th>
        <th>Actions</th>
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
          <td class="text-end pe-4">{{ file.size.toLocaleString() }}</td>
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
  </div>
</template>

<script setup>
import router from './router';
import AuthService from "./services/AuthService";
import {computed, ref, watchEffect} from 'vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import utils from './utils.js'
import axios from "axios";

const props = defineProps(['paths']);
const currentPath = computed(() => props.paths === '' ? ['user'] : props.paths)
const sort = ref('type')
const files = ref([])
const sortedFiles = computed(() => files.value?.sort((a, b) => {
  return a[sort.value].localeCompare(b[sort.value]);
}))

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
    return t.blob().then((b) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(response.data);
        a.setAttribute("download", file.name + ".tsv");
        a.click();
      }
    );
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
  axios.post(`${window.config.backendUrl}/api/files/${currentPath.value}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: function (progressEvent) {
        console.log(parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100)));
      }.bind(this)
    })
    .then(() => location.reload())
    .catch((e) => {
      console.log(e);
    });
}

const uploadFiles = async (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    uploadFile(file);
  }
  return false
}

</script>


<style>
.pointer {
  cursor: pointer;
  text-decoration: none;
}
</style>
