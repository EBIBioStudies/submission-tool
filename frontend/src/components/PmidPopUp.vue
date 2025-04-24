<template>
  <div tabindex="-1" class="modal fade show" style="display: block;" aria-modal="true" @click="close">
    <div class="modal-dialog modal-lg">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">PMID Search</h5>
          <button @click="close" type="button" attr.aria-label="Close" class="btn btn-default "><span aria-hidden="true">×</span></button>
        </div>
        <div class="modal-body">
          <div v-if="loading">Loading...</div>
          <div v-else>
            <input  type="text" placeholder="Search with pmid" class="form-control mb-3" v-model="pmidQuery" ref="searchInput" />
            <table v-if="searchResults.length">
              <thead>
              <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>Year</th>
                <th>Volume</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(result, index) in searchResults" :key="index" >
                <td>{{ result.title }}</td>
                <td>{{ result.authorString }}</td>
                <td>{{ result.pubYear }}</td>
                <td>{{ result.journalVolume }}</td>
                <td><button @click="select(result)" class="btn btn-primary btn-sm">Select</button></td> <!-- Button for selecting a row -->
              </tr>
              </tbody>
            </table>
            <div v-else>No results found</div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="close" class="btn btn-default btn-sm">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {defineProps, defineEmits, ref, watchEffect, watch, nextTick} from 'vue';

const props = defineProps({
  pmid: String
});

const pmidQuery = ref(props.pmid || '');
const emit = defineEmits(['select', 'close']);
const searchResults = ref([]);
const loading = ref(false)
const searchInput = ref(null); // Ref for the input element



function debounce(fn, delay) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// Watch for the modal opening
watch(searchInput, async (newVal) => {
  if (newVal) {
    await nextTick();
    setTimeout(() => {
      searchInput.value?.focus();
    }, 0); // Small delay to ensure rendering
  }
});


// Create a debounced function for search
const debouncedSearch = debounce((query) => {
  // Mocked fetching function, replace with your actual fetch call
  fetchResults(query).then(data => {
    searchResults.value = data.resultList.result;
  });
}, 200); // Debounce time in ms

watchEffect(() => {
  if (pmidQuery.value) {
    loading.value = true
    debouncedSearch(pmidQuery.value);
    loading.value = false
  }
});

const select = (result) => {
  emit('select', result);
};

const close = () => {
  emit('close');
};

async function fetchResults(query) {
  const response = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=ext_id:${query}&format=json`);
  return response.json();
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* High z-index to ensure it's on top */
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  width: auto;
  max-width: 600px; /* Limiting the maximum width */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-body {
  max-height: 400px;
  overflow-y: auto;
}


table {
  width: 100%;
  table-layout: fixed;
}

th:nth-child(1), td:nth-child(1) {
  width: 40%;
  word-break: break-word;
}

td, th {
  white-space: normal;
  word-break: break-word;
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

td:last-child, th:last-child {
  width: 80px;
  text-align: center;
  white-space: nowrap;
}

tr:hover {
  background-color: #f5f5f5;
}

button, input[type="text"] {
  cursor: pointer;
}

input[type="text"] {
  flex-grow: 1; /* Take available space */
  margin-right: 10px; /* Spacing between the input and the button */
}
table tr:nth-child(odd) {
  background-color: #f0f0f0; /* A slightly darker shade than the default */
}
</style>

