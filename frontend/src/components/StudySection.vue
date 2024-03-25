<script setup>
import Section from './Section.vue';
import {computed, ref} from "vue";
import Authors from "@/components/Authors.vue";

defineProps(['section', 'sectionType']);
const sectionComponent = ref(null)
const authorComponent = ref(null)

const errors = computed(() => [...authorComponent.value.errors, ...sectionComponent.value.errors])
defineExpose({errors});
</script>

<template>
  <Authors :section="section" :sectionType="sectionType?.tableTypes?.find( (s) => s.name.toLowerCase() === 'contact')" ref="authorComponent"/>
  <Section :section="section" :sectionType="sectionType" :depth="0" ref="sectionComponent"/>
</template>
