<script setup>
import { ref, defineEmits } from "vue";

const selectedOption = ref("noFilesUpdated"); // Default selected option

// Emits events to the parent component
const emit = defineEmits(["hide", "resubmit"]);

const hide = () => {
  emit("hide");
};

const resubmit = () => {
  emit("resubmit", selectedOption.value);
};

const stopPropagation = (event) => {
  event.stopPropagation(); // Prevent event from bubbling to parent
};
</script>

<template>
  <!-- Modal Overlay -->
  <div class="modal-overlay" @click="hide">
    <div class="modal-content" @click.stop="stopPropagation">
      <div class="modal-header">
        <h3 class="modal-title">Did you update any files?</h3>
        <button type="button" class="close" aria-label="Close" @click="hide">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <p>
          If you are changing only the metadata (e.g., Title, Description, Release Date, and other text fields),
          we will not need to upload and validate the files again, and the submission process will be faster.
        </p>

        <div class="form-check">
          <input
            id="no-files-updated"
            type="radio"
            class="form-check-input"
            name="resubmit-options"
            value="noFilesUpdated"
            v-model="selectedOption"
          />
          <label class="form-check-label" for="no-files-updated">
            No, I have not updated any files
          </label>
        </div>

        <div class="form-check">
          <input
            id="files-updated"
            type="radio"
            class="form-check-input"
            name="resubmit-options"
            value="filesUpdated"
            v-model="selectedOption"
          />
          <label class="form-check-label" for="files-updated">
            Yes, one or more files have been updated
          </label>
        </div>

        <div class="modal-footer">
          <button type="submit" class="btn btn-success btn-sm" @click="resubmit">
            Re-submit
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
  width: 400px;
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
