<script setup>
import RecursiveSection from './Section.vue';

defineProps(['section', 'sectionType']);
</script>

<template>
  <RecursiveSection
    :section="section"
    :sectionType="sectionType"
    :collapsed="false"
  />
</template>
