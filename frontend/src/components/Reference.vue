<script setup>
import Multiselect from "@vueform/multiselect";
import { inject, ref } from "vue";

const props = defineProps(['class', 'fieldType']);
const submission = inject('submission');
const options = ref([]);

// Centralized logic to build option list
function buildOptions() {
  const list = [];
  const q = [submission.value?.section];

  while (q.length) {
    const section = q.pop();
    if (props.fieldType?.controlType?.section_type === section?.type) {
      const att = section?.attributes?.find(
        (a) => a.name.toLowerCase() === props.fieldType?.controlType?.field_name?.toLowerCase()
      );
      list.push({
        value: att?.value ?? section?.accno,
        label: att?.value ?? section?.type,
      });
    }
    section?.subsections?.forEach((s) => q.push(s));
  }

  return list;
}

// Initialize once
options.value = buildOptions();

// Refresh on dropdown open while preserving object identity
function refreshOptions() {
  const oldOptionMap = new Map(options.value.map(opt => [opt.value, opt]));
  const fresh = buildOptions();
  options.value = fresh.map(opt => oldOptionMap.get(opt.value) || opt);
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
    track-by="value"
    @open="refreshOptions"
  />
</template>
