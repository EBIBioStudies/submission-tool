<script setup lang="ts">

import { PageTab } from '@/models/PageTab.model.ts';
import { Template } from '@/models/Template.model.ts';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { computed, inject, ref, Ref } from 'vue';
import Attribute from '@/components/Attribute.vue';
import { AttributeExpose, ControlError, SectionExpose } from 'components/expose.model.ts';

const props = defineProps<{
  section: PageTab.Section,
  annotation: Template.AnnotationType
}>();

const annotations = computed(() => props.section.attributes || []); // TODO check it's alright and doesn't require a filter to distinguish annotation from "regular" attributes
const nameOptions = computed(() => props.annotation.columnTypes.map(c => c.name));
const annotationNameToType = computed(() => new Map(props.annotation.columnTypes.map(c => [c.name, c])));
const parentDisplayType = inject<Ref<Template.DisplayType>>('parentDisplayType');

const attributeRefs = ref<AttributeExpose[]>();

const errors = computed(() => {
 const _errors: ControlError<AttributeExpose>[] = [];
  // validate subsections
  attributeRefs?.value?.forEach((attribute) => {
    const err = attribute.errors?.value;
    if (err) _errors.push({
      errorMessage: err,
      control: attribute,
      element: document.getElementById(attribute.attributeId)!,
    });
  });

  // annotations.value.forEach((annotation, i) => {
  //   if (!attributeRefs.value?.[i]) return;
  //   if (!annotation.name) errors.push({ errorMessage: 'Please set annotation name or remove annotation', control: attributeRefs.value[i], element: document.getElementById(attributeRefs.value![i].attributeId)! });
  //   if (!annotation.value) errors.push({ errorMessage: 'Please set annotation value or remove annotation', control: attributeRefs.value![i], element: document.getElementById(attributeRefs.value![i].attributeId)! });
  // })
  return _errors;
});

defineEmits<{
  newAnnotation: [],
  deleteAnnotation: [annotation: number]
}>();

defineExpose<SectionExpose>({ errors });
</script>


<template>
  <Attribute v-for="(annotation, index) in annotations"
             :nameOptions ref="attributeRefs"
             :parent="annotations"
             :attribute="annotation as PageTab.BuildingSection"
             :field-type="annotationNameToType.get(annotation.name)"
             @delete-attribute="() => $emit('deleteAnnotation', index)"

  />
  <div class="branch mt-2">
    <button
      v-if="parentDisplayType !== 'readonly'"
      class="btn btn-light btn-small text-black-50"
      @click="$emit('newAnnotation')"
    >
      <font-awesome-icon
        :icon="['fas', 'plus']"
        class="icon fa-fw"
      ></font-awesome-icon>
      <i>New Annotation</i>
    </button>
  </div>

</template>

<style scoped>

</style>
