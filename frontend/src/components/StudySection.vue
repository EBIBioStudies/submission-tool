<script setup lang="ts">
import Section from './Section.vue';
import { computed, ref } from 'vue';
import { PageTab } from '@/models/PageTab.model.ts';
import { Template } from '@/models/Template.model.ts';
import { SectionExpose } from 'components/expose.model.ts';

defineProps<{
  section: PageTab.Section;
  sectionType: Template.SectionType;
}>();
const sectionComponent = ref<InstanceType<typeof Section>>();

const errors = computed(() => [...sectionComponent.value?.errors || []]);


defineExpose<SectionExpose>({ errors });
</script>

<template>
  <Section :section="section" :sectionType="sectionType" :depth="0" ref="sectionComponent" />
</template>
