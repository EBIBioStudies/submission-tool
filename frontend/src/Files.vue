<template>

  <div class="pb-4">
    <div class="d-inline-block" v-for="(folder, index) in props.paths">
      <font-awesome-icon v-if="index!==0" icon="fa-angle-right"
                         class="fa-2xs text-black-50 opacity-25 ps-2 pe-2 align-middle"></font-awesome-icon>
      <router-link v-if="index!==props.paths.length" class="text-decoration-none"
                   :to="`/files/${props.paths.slice(0,index+1).join('/')}`">
        <font-awesome-icon v-if="index==0" icon="fa-home" class="pe-1"></font-awesome-icon>
        <span v-if="index===0">Home</span><span v-else>{{ folder }}</span>
      </router-link>
      <span v-else>{{ folder }}</span>
    </div>
  </div>

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
            <button class="btn btn-link text-primary" v-if="file.type.toLowerCase()!=='dir'"
                    @click.stop="download(file)">
              <font-awesome-icon icon="fa-download"></font-awesome-icon>
            </button>
            <button class="btn btn-link text-primary" v-else>
              <font-awesome-icon icon="fa-regular fa-file-lines"></font-awesome-icon>
            </button>
            <button class="btn btn-link text-danger">
              <font-awesome-icon icon="fa-regular fa-trash-can"></font-awesome-icon>
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import AuthService from "./services/AuthService";
import {computed, ref, watchEffect} from 'vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const props = defineProps(['paths']);
const sort = ref('type')
const files = ref([])
const router = useRouter();
const sortedFiles = computed(() => files.value?.sort((a, b) => {
  return a[sort.value].localeCompare(b[sort.value]);
}))

watchEffect(async () => {
  if (!AuthService.isAuthenticated()) return
  const path = props.paths && props.paths !== '' ? props.paths.join('/') : 'user/'
  const response = await fetch(
    `${window.config.backendUrl}/api/files/${path}`,
  ).then(r => r.json())
    .then(r => files.value = r)
})

const navigate = async (path, name) => {
  await router.push(`/files/${path}/${name}`)
}

const download = (file) => {
  const downloadPath = `${window.config.backendUrl}/api/files/${file.path}?fileName=${file.name}`;
  fetch(downloadPath).then(function (t) {
    return t.blob().then((b) => {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.setAttribute("download", file.name);
        a.click();
      }
    );
  });
}

</script>


<style>
.pointer {
  cursor: pointer;
  text-decoration: none;
}
</style>
