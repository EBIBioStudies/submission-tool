<script setup>
import Multiselect from '@vueform/multiselect';
import { inject, ref } from 'vue';

const model = defineModel()
const props = defineProps(['class', 'fieldType']);
const submission = inject('submission');
const options = ref([]);

const getOrgName = (orgId) => {
  return submission.value.section.subsections.filter((s) => {
    return (s?.type?.toLowerCase() === 'organisation' || s?.type?.toLowerCase() === 'organization')
      && s?.accno===orgId
  } )[0] ?? {}
}

const orgs = ref(model.value.map( i => {
  let o = { ...i, ...getOrgName(i.value) };
  return o
}));


const createOrg = (k) => {
  console.log(k);
  return false;
};
const deleteOrg = (k) => {
  console.log(k);
  return false;
};
</script>

<template>
  <Multiselect :allow-absent="true"
               mode="tags"
               label="attributes"
               :allow-empty="false"
               :allowAbsent="true"
               :class="props.class"
               :createOption="true"
               :searchable="true"
               class="form-control
               form-control-sm org"
               noOptionsText="Type+↵ to add"
               @create="createOrg"
               @deselect="deleteOrg"
               @select="createOrg"
               v-model="orgs"
               object
  >
  </Multiselect>

</template>

<style scoped>
.org {
  min-width: 120pt !important;
}
</style>
<style>
.org .multiselect-caret {
  margin: 0 0 !important;
}

.org .multiselect-search {
  padding-left: 0;
}
</style>
