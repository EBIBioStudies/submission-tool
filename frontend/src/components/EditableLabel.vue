<script setup>
import {inject, nextTick, ref, watch} from 'vue';

// Props
const props = defineProps(['data', 'isEditable']);

const parentDisplayType = inject('parentDisplayType')
const inputRef = ref(null);


const isEditing = ref(false);
const editableValue = ref(props.data);


const toggleEdit = (event) => {
  if(!props.isEditable || parentDisplayType === 'readonly')
    return;
  isEditing.value = true;
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
  event.stopPropagation();
};

const saveEdit = () =>{
  isEditing.value = false;
}

</script>

<template>
  <div class="editable-label">
    <!-- Display the label or input based on `isEditing` -->
    <div v-if="!isEditing && parentDisplayType !== 'readonly'" @click="toggleEdit" class="label">
      {{editableValue.type}}
      <font-awesome-icon v-if="props.isEditable && parentDisplayType !== 'readonly'" :icon="['far', 'edit']"  class="pe-2"/>
    </div>
    <input
      v-else
      v-model="editableValue.type"
      @blur="saveEdit"
      @keydown.enter="saveEdit"
      @focusout="saveEdit"
      @click.stop
      ref="inputRef"
      class="input"
      :placeholder="editableValue.type"
    />
  </div>
</template>



<style scoped>
.editable-label {
  display: inline-block;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.3s ease-in-out;
}

.label {
  background-color: #f5f5f5;
  color: #333;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
}

.label:hover {
  background-color: #e0e0e0;
}

.input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  width: auto;
}

.input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.5);
}
</style>
