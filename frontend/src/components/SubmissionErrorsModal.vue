<script setup lang="ts">

withDefaults(
  defineProps<{ errors: string[] }>(),
  { errors: () => [] },
);

const emits = defineEmits<{
  hide: []
}>();

const hide = () => emits('hide');

const stopPropagation = (event: Event) => event.stopPropagation();
</script>

<template>
  <!-- Modal Overlay -->
  <div class="modal-overlay" @click="hide">
    <div class="modal-content" @click.stop="stopPropagation">
      <div class="modal-header">
        <h3 class="modal-title">Submission Errors</h3>
        <button type="button" class="close" aria-label="Close" @click="hide">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <ul v-if="errors.length">
          <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
        </ul>
        <p v-else class="text-muted">No errors found.</p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" @click="hide">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Background overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal box */
/* Modal box */
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh; /* Set a max height */
  overflow-y: auto; /* Enable scrolling inside modal */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
}


/* Header */
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

/* Body */
.modal-body {
  margin-top: 10px;
}

/* Footer */
.modal-footer {
  margin-top: 15px;
  text-align: right;
}

.modal-body ul {
  padding-left: 20px;
  max-width: 100%;
  word-wrap: break-word;
}

.modal-body li {
  margin-bottom: 8px;
  line-height: 1.4;
}

</style>
