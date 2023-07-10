<script setup>
import StudySection from './StudySection.vue';

defineProps(['submission', 'template']);
</script>

<template>
  <div>
    <div class="accession">Accession: {{ submission.accno }}</div>
    <div v-for="attribute in submission.attributes" :key="attribute.id">
      <div>{{ attribute.name }} : {{ attribute.value }}</div>
    </div>
    <StudySection
      :section="submission.section"
      :sectionType="template?.sectionType"
      v-if="submission?.section?.type?.toLowerCase() === 'study'"
    />
  </div>
</template>

<style scoped>
.accession {
  font-size: 2em;
}
.submission {
  padding: 1em;
}
</style>
