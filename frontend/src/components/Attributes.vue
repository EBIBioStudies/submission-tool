<script setup>
import { computed, inject, ref } from 'vue';
import Attribute from './Attribute.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { addMissingAttributesGeneral } from '@/composables/useAttributesHelper';

const props = defineProps(['attributes', 'fieldTypes', 'isSectionAttribute']);
const emits = defineEmits([
  'deleteAttribute',
  'createTag',
  'deleteTag',
  'newAttribute',
]);
const attributeList = ref(props.attributes);
const duplicateAttributes = attributeList.value?.filter(
  (value, index, array) =>
    array.find((v, i) => v.name === value.name) !== value && value.name !== '',
);
const attributeRefs = ref([]);
const parentDisplayType = inject('parentDisplayType');

const processed = (attribute) => duplicateAttributes.includes(attribute);

const getFieldType = (attribute) => {
  const fieldType = props?.fieldTypes?.find(
    (f) => f.name?.toLowerCase() === attribute?.name?.toLowerCase(),
  );
  return fieldType ? fieldType : props?.attributes?.length > 1 ? attribute : '';
};

const addMissingAttributes = () => {
  addMissingAttributesGeneral(attributeList, props.fieldTypes);
};

const errors = computed(() => {
  const _errors = [];
  // validate subsections
  attributeRefs?.value.forEach((a) => {
    const err = a.errors;
    if (err)
      _errors.push({
        errorMessage: err,
        control: a,
        element: document.getElementById(a.attributeId),
      });
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
        <Attribute
          :key="index"
          ref="attributeRefs"
          :attribute="attribute"
          :field-type="getFieldType(attribute)"
          :parent="attributeList"
          @createTag="(v) => emits('createTag', v)"
          :isSectionAttribute="isSectionAttribute"
          @deleteAttribute="(v) => emits('deleteAttribute', index)"
          @deleteTag="(v) => emits('deleteTag', v)"
        />
      </template>
    </div>

    <div v-if="isSectionAttribute" class="branch mt-2">
      <button
        v-if="parentDisplayType !== 'readonly'"
        class="btn btn-light btn-small text-black-50"
        @click="$emit('newAttribute')"
      >
        <font-awesome-icon
          :icon="['fas', 'plus']"
          class="icon fa-fw"
        ></font-awesome-icon>
        <i>New Attribute</i>
      </button>
    </div>
  </div>
</template>
