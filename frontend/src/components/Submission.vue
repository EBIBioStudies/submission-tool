<script setup>
import StudySection from './StudySection.vue';
import {computed, ref} from "vue";

const props = defineProps(['submission', 'template', 'accession']);
const studyComponent = ref(null)
const errors = computed(() => studyComponent.value.errors)
defineExpose({errors});
</script>

<template>
  <div>
    <div v-if="template?.sectionType?.banner" class="card"
         :style="`background-color: ${template?.sectionType?.banner?.backgroundColor}`">
      <img height="70" :src="`${template?.sectionType?.banner?.src}`"/>
    </div>
    <h5 class="text-success">{{ accession }}</h5>
    <h4>{{submission?.attributes?.find(a=>a.name.toLowerCase()==='title')?.value}}&nbsp;</h4>
    <StudySection
      :section="submission.section"
      :sectionType="template?.sectionType"
      v-if="submission?.section?.type?.toLowerCase() === 'study'"
      ref="studyComponent"
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
