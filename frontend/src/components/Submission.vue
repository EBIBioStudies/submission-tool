<script setup>
import StudySection from './StudySection.vue';
import {ref} from "vue";

defineProps(['submission', 'template']);
const studyComponent = ref(null)

const isValid = ref(true);
const validate = () => {
  studyComponent.value.validate();
  isValid.value = !!studyComponent.value.isValid;
}
defineExpose({validate, isValid});
</script>

<template>
  <div>
    <div v-if="template?.sectionType?.banner" class="card"
         :style="`background-color: ${template?.sectionType?.banner?.backgroundColor}`">
      <img height="70" :src="'/src/assets/'+template?.sectionType?.banner?.src"/>
    </div>
    <div class="accession">{{ submission.accno }}</div>
    <div v-for="(attribute, i) in submission.attributes" :key="i">
      <div>
        {{ attribute.name }} :
        {{ attribute.value }}
      </div>
    </div>
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
