<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const selectedOption = ref('noFilesUpdated'); // Default selected option

// Emits events to the parent component
const emit = defineEmits<{
  hide: [],
  submit: []
}>();

const hide = () => emit('hide');

const submit = () => emit('submit');

const stopPropagation = (event: Event) => {
  event.stopPropagation(); // Prevent event from bubbling to parent
};
</script>

<template>
  <!-- Modal Overlay -->
  <div class="modal-overlay" @click="hide">
    <div class="modal-content" @click.stop="stopPropagation">
      <div class="modal-header">
        <h3 class="modal-title">You are about to submit your draft</h3>
        <button type="button" class="close" aria-label="Close" @click="hide">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <p>
          Your draft is saved automatically on every modification, submitting it is the final step before your draft is
          published.
        </p>
        <p>
          After submission, if it is successful, you will be able to access your study privately until the release date
          is reached, at which point it will become accessible to public
        </p>

        <div class="bg-warning mt-3 p-2 rounded-3 lh-1">
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
          Please make sure to not modify your uploaded files or reorganize them while the submission is being processed
        </div>

        <div class="modal-footer gap-2">
          <button type="button" class="btn btn-secondary btn-sm" @click="hide">
            Cancel
          </button>
          <button type="submit" class="btn btn-success btn-sm" @click="submit">
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Background overlay to make modal visible */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Dark overlay for visibility */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Centered modal box */
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 550px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
}

/* Header Styling */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

/* Close Button */
.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* Footer */
.modal-footer {
  margin-top: 15px;
  text-align: right;
}
</style>
