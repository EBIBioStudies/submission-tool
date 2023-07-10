<script setup>
import { ref } from 'vue';
import Multiselect from '@vueform/multiselect';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps(['attribute', 'fieldType']);
const currentAttribute = ref(props.attribute);
</script>

<template>
  <!--label-->
  <label class="input-group-text">
    <font-awesome-icon
      v-if="fieldType?.icon"
      class="icon"
      :icon="fieldType?.icon"
    ></font-awesome-icon>
    <font-awesome-icon
      v-else
      class="icon"
      inverse
      icon="fa-check"
    ></font-awesome-icon>
    <span class="text-muted" v-if="fieldType">{{ fieldType.name }}</span>
    <span v-else>
      <input
        class="input-group-text text-start d-inline-block"
        v-model="currentAttribute.name"
        placeholder="Attribute name"
      /><font-awesome-icon
        class="icon"
        icon="fa-edit"
        transform="shrink-4"
      ></font-awesome-icon>
    </span>
  </label>

  <!--largetext-->
  <textarea
    v-if="fieldType?.controlType?.name === 'largetext'"
    type="text"
    class="form-control"
    rows="3"
    :placeholder="fieldType?.controlType?.placeholder"
    v-model="currentAttribute.value"
  ></textarea>

  <!-- select  -->
  <Multiselect
    v-else-if="fieldType?.controlType?.name === 'select'"
    v-model="currentAttribute.value"
    class="form-control"
    :searchable="true"
    :createOption="true"
    :options="fieldType?.controlType?.values"
  >
  </Multiselect>

  <!-- default / text -->
  <input
    v-else
    type="text"
    class="form-control"
    :placeholder="fieldType?.controlType?.placeholder"
    v-model="currentAttribute.value"
  />
</template>

<style scoped>
label {
  min-width: 18em;
}
</style>
<style src="@vueform/multiselect/themes/default.css"></style>
