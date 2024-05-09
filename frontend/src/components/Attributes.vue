<script setup>
import { computed, ref } from 'vue';
import Attribute from './Attribute.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps(['attributes', 'fieldTypes']);
const emits = defineEmits(['deleteAttribute', 'createTag', 'deleteTag', 'newAttribute']);
const attributeList = ref(props.attributes);
const duplicateAttributes = attributeList.value?.filter(
  (value, index, array) => array.find((v, i) => v.name === value.name) !== value && value.name !== '',
);
const attributeRefs = ref([]);

// const nonTemplateAttributes = computed(() => {
//   const fieldTypeNames = props.fieldTypes?.map((f) => f.name) ?? [];
//   return props.attributes.filter((attr) => !fieldTypeNames.includes(attr.name));
// });
//
// const isAttributeInTemplate = (fieldType, i) => {
//   const attr = attributeList?.value?.find(
//     (f) => f?.name?.toLowerCase() === fieldType?.name?.toLowerCase(),
//   );
//   if (attr) return true;
// };
//
// const getAttribute = (fieldType, i) => {
//   let attr = attributeList?.value?.find(
//     (f) => f?.name?.toLowerCase() === fieldType?.name?.toLowerCase(),
//   );
//   if (attr) return attr;
//   // template attribute is not in the pagetab. Create it only if it's required.
//   attr = { name: fieldType.name, value: '' };
//   attributeList?.value.splice(i, 0, attr);
//   return attr;
// };

const processed = (attribute) => duplicateAttributes.includes(attribute);

const getFieldType = (attribute) => {
  return props.fieldTypes?.find((f) => f.name?.toLowerCase() === attribute?.name?.toLowerCase());
};

const addMissingAttributes = () => {
  for (let i = 0; i < props.fieldTypes?.length; i++) {
    const fieldType = props.fieldTypes[i];
    // exit if not required
    if (fieldType?.display !== 'required') continue;
    let attr = attributeList?.value?.find(
      (f) => f?.name?.toLowerCase() === fieldType?.name?.toLowerCase(),
    );
    if (attr) continue;
    // template attribute is not in the pagetab. Create it (only if it's required).
    // desirable should not be added in a re-render. They should only be part of the initial empty pagetab
    attr = { name: fieldType.name, value: '' };
    attributeList?.value?.splice(i, 0, attr);
  }
};

const errors = computed(() => {
  const _errors = [];
  // validate subsections
  attributeRefs?.value.forEach((a) => {
    const err = a.errors;
    if (err) _errors.push({ errorMessage: err, control: a, element: document.getElementById(a.attributeId) });
  });
  return _errors;
});
defineExpose({ errors });

addMissingAttributes();
</script>

<template>
  <div>
    <div v-for="(attribute, index) in attributeList" :key="index">
      <template v-if="!processed(attribute)">
        <Attribute :key="index" ref="attributeRefs" :attribute="attribute" :field-type="getFieldType(attribute)"
                   :parent="attributeList" @createTag="(v) => emits('createTag', v)"
                   @deleteAttribute="(v) => emits('deleteAttribute', index)"
                   @deleteTag="(v) => emits('deleteTag', v)" />
      </template>
    </div>

    <div class="branch mt-2">
    <button class="btn btn-light btn-small text-black-50" @click="$emit('newAttribute')">
      <font-awesome-icon :icon="['fas','plus']" class="icon fa-fw"></font-awesome-icon>
      <i>New Attribute</i>
    </button>
    </div>

  </div>
</template>
