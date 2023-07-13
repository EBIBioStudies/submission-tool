<script setup>
import { ref } from 'vue';
import Attribute from './Attribute.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps(['attributes', 'fieldTypes']);
const emits = defineEmits(['deleteAttribute', 'createTag', 'deleteTag']);
const attributeList = ref(props.attributes);
const processedAttributes = new Set();

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

const getFieldType = (attribute) => {
  processedAttributes.add(attribute.name);
  return props.fieldTypes?.find((f) => f.name === attribute?.name);
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
    attributeList?.value.splice(i, 0, attr);
  }
};

addMissingAttributes();
</script>

<template>
  <div>
    <div v-for="(attribute, index) in attributeList" :key="'att' + index">
      <div
        class="input-group ps-2 pb-2"
        v-if="!processedAttributes.has(attribute.name)"
      >
        <Attribute
          :attribute="attribute"
          :field-type="getFieldType(attribute)"
          :parent="attributeList"
          @createTag="(v) => emits('createTag', v)"
          @deleteTag="(v) => emits('deleteTag', v)"
        />
        <span class="btn-group-vertical">
          <font-awesome-icon
            class="icon"
            role="button"
            @click="$emit('deleteAttribute', index)"
            v-if="getFieldType(attribute)?.display !== 'required'"
            icon="fa-trash"
          ></font-awesome-icon>
          <font-awesome-icon
            class="icon"
            role="button"
            v-else
            inverse
            icon="fa-trash"
          ></font-awesome-icon>
        </span>
      </div>
    </div>
  </div>
</template>
