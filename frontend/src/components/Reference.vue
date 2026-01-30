<script setup lang="ts">
import Multiselect from '@vueform/multiselect';
import { inject, ref, Ref } from 'vue';
import { Template } from '@/models/Template.model.ts';
import { PageTab } from '@/models/PageTab.model.ts';
import { Class } from '@/utils.ts';

const props = defineProps<{
  class?: Class;
  fieldType: Template.FieldType;
}>();
const submission = inject<Ref<Partial<PageTab.LocalSubmission>>>('submission');

export interface Option {
  value: string;
  label: string;
}

const options = ref<Option[]>([]);

// Centralized logic to build option list
function buildOptions() {
  const list: Option[] = [];
  const q = [submission!.value?.section];

  while (q.length) {
    const section = q.pop();
    if (props.fieldType?.controlType?.section_type === section?.type) {
      const att = section?.attributes?.find(
        (a) => a.name.toLowerCase() === props.fieldType?.controlType?.field_name?.toLowerCase()
      );
      list.push({
        value: att?.value ?? section?.accno!,
        label: att?.value ?? section?.type!,
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
