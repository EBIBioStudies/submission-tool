<script setup>
import Section from './Section.vue';
import {ref} from "vue";

defineProps(['section', 'sectionType']);
const sectionComponent = ref(null)

const isValid = ref(true);
const validate = () => {
  sectionComponent.value.validate();
  isValid.value = !!sectionComponent.value.isValid;
}
defineExpose({validate, isValid});
</script>

<template>
  <Section :section="section" :sectionType="sectionType" :depth="0" ref="sectionComponent"/>
</template>
