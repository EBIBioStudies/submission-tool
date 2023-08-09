<script setup>
import StudySection from './StudySection.vue';
import {ref} from "vue";

defineProps(['submission', 'template']);
const studyComponent = ref(null)

const isValid = ref(true);
const validate = () => {
  studyComponent.value.validate();
  isValid.value = studyComponent.value.isValid;
}

const submitDraft = () => {
  validate()
}
</script>

<template>
  <div>
    <form>
      <div class="text-end"> {{isValid}}
        <button class="btn btn-primary" type="button" @click="submitDraft()">Submit</button>
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
    </form>
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
