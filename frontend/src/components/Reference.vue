<script setup>
import Multiselect from "@vueform/multiselect";
import {inject, ref} from "vue";

const props = defineProps(['class', 'fieldType'])
const submission = inject('submission')
const options = ref([])
if (props.fieldType?.controlType?.type === 'section') {
  let q = [];
  q.push(submission.value?.section)
  while (q.length) {
    const section = q.pop();
    if (props.fieldType?.controlType?.section_type === section?.type) {
      const att = section?.attributes?.find((a) =>a.name.toLowerCase() === props.fieldType?.controlType?.field_name?.toLowerCase())
      options.value.push({
        value: section.accno,
        label: att?.value ?? section.type
      })
    }
    section?.subsections?.forEach((s) => q.push(s))
  }
}
</script>

<template>
  <Multiselect
    :allow-absent="false"
    class="form-control"
    :searchable="true"
    :class="props.class"
    :allow-empty="false"
    :options="options"
  >
  </Multiselect>
</template>

<style scoped>

</style>
