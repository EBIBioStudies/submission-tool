<script setup>
import Multiselect from '@vueform/multiselect';
import { inject, ref } from 'vue';

const model = defineModel()
const props = defineProps(['class', 'fieldType']);
const submission = inject('submission');
const emits = defineEmits(['deleteOrg'])

const options = ref([]);
// get organisation which matches the affiliation reference
const getOrgName = (affiliation) => submission?.value.section.subsections.filter((s) =>  (s?.type?.toLowerCase() === 'organisation'
      || s?.type?.toLowerCase() === 'organization')
      && s?.accno===affiliation.value
  )[0];

const organisations = ref(model.value.map( affiliation => {
  return {...affiliation, ...getOrgName(affiliation)}
}));

const createOrg = (k) => {
  console.log(k);
  return false;
};
</script>

<template>
  <Multiselect :allow-absent="true"
               mode="tags"
               :allow-empty="false"
               :allowAbsent="true"
               :class="props.class"
               :createOption="true"
               :searchable="true"
               class="form-control
               form-control-sm org"
               noOptionsText="Type+↵ to add"
               @create="o=>emits('create',o)"
               @select="o=>emits('select',o)"
               @deselect="o=>emits('deleteOrg',o)"
               v-model="organisations"
               object
  ><template v-slot:tag="{ option, handleTagRemove, disabled }">
    <div
      class="multiselect-tag is-user"
      :class="{
          'is-disabled': disabled,
        }"
    >
      {{ option?.attributes.filter( attr=> attr.name==='Name')[0].value }}
      <span
        v-if="!disabled"
        class="multiselect-tag-remove"
        @mousedown.prevent="handleTagRemove(option, $event)"
      >
          <span class="multiselect-tag-remove-icon"></span>
        </span>
    </div>
  </template>
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
