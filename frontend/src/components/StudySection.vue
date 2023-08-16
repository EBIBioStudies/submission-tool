<script setup>
import Section from './Section.vue';
import {computed, ref} from "vue";

defineProps(['section', 'sectionType']);
const sectionComponent = ref(null)

const errors = computed(() => sectionComponent.value.errors)
defineExpose({errors});
</script>

<template>
  <Section :section="section" :sectionType="sectionType" :depth="0" ref="sectionComponent"/>
</template>
