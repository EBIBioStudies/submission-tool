<script setup>
import Section from './Section.vue';
defineProps(['section', 'sectionType']);
</script>

<template>
  <Section :section="section" :sectionType="sectionType" :depth="0" />
</template>
