<script setup>
import Multiselect from '@vueform/multiselect';
import { inject, ref } from 'vue';
import axios from 'axios';

const model = defineModel();
const props = defineProps(['class', 'fieldType']);
const submission = inject('submission');
const emits = defineEmits(['deleteOrg', 'createOrg']);

// get organisation which matches the affiliation reference
const organisations = ref([]);
const parentDisplayType = inject('parentDisplayType')

const updateOptions = async (query) => {
  if (!query || query.length < 3) return [];
  return axios({
    url: `https://api.ror.org/v1/organizations?query=${query}`,
    headers: { 'content-type': 'application/json' },
    method: 'GET',
  }).then(response => response.data?.items?.map(i => {
    return { label: i.name, value: i.id };
  }).filter( entry => {
    return organisations.value.filter( org=> org?.label===entry.label).length===0
  }) );
};
organisations.value = model.value.map(affiliation => {
  const org = submission?.value.section.subsections.filter( s => (s?.type?.toLowerCase() === 'organisation'
    || s?.type?.toLowerCase() === 'organization') && s?.accno === affiliation.value)[0];
  const label = org?.attributes.find(attr => attr.name === 'Name')?.value;
  const rorIdAttribute = org?.attributes.find(attr => attr.name === 'RORID');
  return {
    accno: affiliation.value,
    label: label,
    value: rorIdAttribute?.length ? rorIdAttribute.value : label
  };
}).filter ( option=> option.label && option.label!=='')

</script>

<template>
  <Multiselect mode="tags"
               no-options-text="Type+↵ to add"
               v-model="organisations"
               class="form-control form-control-sm org"
               :allow-empty="false"
               :class="props.class"
               :create-option="true"
               :searchable="true"
               :allow-absent="true"
               :options="async (q)=> await updateOptions(q)"
               :object="true"
               :delay="0"
               :min-chars="3"
               :disabled="parentDisplayType==='readonly'"
               :filter-results="false"
               :hide-selected="true"
               :can-clear="false"
               @deselect="(v) => { emits('deleteOrg', v); return false;}"
               @create="(v) => { emits('createOrg', v); return false;}"
               @select="(v) => { emits('createOrg', v); return false;}"

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
