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
  pendingValue?: boolean;
}

const options = ref<Option[]>([]);
const isDisabled = computed(() => props.disabled || options.value.length === 0);

function getSectionCounts(root?: PageTab.Section) {
  const counts = new Map<string, number>();
  const q = [root];

  while (q.length) {
    const section = q.shift();
    if (!section) continue;

    if (props.fieldType?.controlType?.section_type?.toLowerCase() === section.type?.toLowerCase()) {
      counts.set(section.type?.toLowerCase(), (counts.get(section.type?.toLowerCase()) ?? 0) + 1);
    }
    section.subsections?.flatMap(ensureArray)?.forEach((s) => q.push(s));
  }
  return counts;
}

// Centralized logic to build option list
function buildOptions() {
  const list: Option[] = [];
  const root = submission!.value?.section;
  const q = [root];
  const sectionCounts = getSectionCounts(root);

  while (q.length) {
    const section = q.shift()!;
    if (props.fieldType?.controlType?.section_type?.toLowerCase() === section.type?.toLowerCase()) {
      const att = section?.attributes?.find(
        (a) => a.name.toLowerCase() === props.fieldType?.controlType?.field_name?.toLowerCase(),
      );
      const key = section?.accno ?? `${section?.type}:${list.length}`;
      const label = sectionCounts.get(section.type?.toLowerCase())! > 1
        ? `${section.type} (${list.length + 1})`
        : section.type;
      const value = att?.value?.trim() ? att.value : undefined;
      const pendingValue = !value; // Mark pending value to highlight in dropdown

      list.push({
        value: value ?? key,
        label: value ?? label,
        key,
        pendingValue,
      });
    }
    section?.subsections?.flatMap(ensureArray)?.forEach((s) => q.push(s));
  }
  return list;
}

const sourceOptions = computed(buildOptions);

// Refresh on dropdown open while preserving object identity
function refreshOptions() {
  const selectedOption = options.value.find(opt => opt.value === model.value);
  const selectedKey = selectedOption?.key;
  const oldOptionMap = new Map(options.value.map(opt => [opt.key, opt]));
  options.value = sourceOptions.value.map((opt) => {
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
  flush: 'sync', // flush: 'sync' updates reference values before Edit.vue snapshots the draft for autosave.
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
  >
    <template #option="{ option }">
      <span :class="{ 'fst-italic': option.pendingValue }">{{ option.label }}</span>
    </template>

    <template #singlelabel="{ value }">
      <div class="multiselect-single-label">
        <span :class="{ 'fst-italic': value.pendingValue }">{{ value.label }}</span>
      </div>
    </template>
  </Multiselect>
</template>
