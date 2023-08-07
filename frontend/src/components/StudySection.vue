<script setup>
import Section from './Section.vue';
import {addTable} from '@/utils';

defineProps(['section', 'sectionType']);
</script>

<template>
  <Section :section="section" :sectionType="sectionType" :depth="0"
           @addTable="(msg)=>addTable(msg.section, msg.instance)"
  />
</template>
