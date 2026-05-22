<script setup lang="ts">
import Multiselect from '@vueform/multiselect';
import { computed, inject, ref, Ref, watch } from 'vue';
import { Template } from '@/models/Template.model.ts';
import { PageTab } from '@/models/PageTab.model.ts';
import { Class, ensureArray } from '@/utils.ts';

const props = defineProps<{
  class?: Class;
  fieldType: Template.FieldType;
  disabled?: boolean;
}>();
const model = defineModel<string>();

const submission = inject<Ref<Partial<PageTab.LocalSubmission>>>('submission');

export interface Option {
  value: string;
  label: string;
  key: string;
}

const options = ref<Option[]>([]);
const isDisabled = computed(() => props.disabled || options.value.length === 0);

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
      const value = att?.value;
      if (!value) continue;

      list.push({
        value,
        label: value,
        key: section?.accno ?? `${section?.type}:${list.length}`,
      });
    }
    section?.subsections?.flatMap(ensureArray)?.forEach((s) => q.push(s));
  }
  return list;
}

const sourceOptions = computed(buildOptions);

// Refresh on dropdown open while preserving object identity
function refreshOptions(fresh = sourceOptions.value) {
  const selectedOption = options.value.find(opt => opt.value === model.value);
  const selectedKey = selectedOption?.key;
  const oldOptionMap = new Map(options.value.map(opt => [opt.key, opt]));
  options.value = fresh.map((opt) => {
    const oldOption = oldOptionMap.get(opt.key);
    if (!oldOption) return opt;
    Object.assign(oldOption, opt);
    return oldOption;
  });

  const updatedSelectedOption = options.value.find(opt => opt.key === selectedKey);
  if (updatedSelectedOption && model.value !== updatedSelectedOption.value) {
    model.value = updatedSelectedOption.value;
  }
}

watch(sourceOptions, refreshOptions, {
  immediate: true, // immediate seeds Multiselect as soon as the component mounts.
  flush: 'sync' // flush: 'sync' updates reference values before Edit.vue snapshots the draft for autosave.
});
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
    :append-to-body="true"
    :disabled="isDisabled"
    v-model="model"
  />
</template>
