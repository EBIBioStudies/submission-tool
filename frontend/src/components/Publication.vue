<template>
  <div class="form-control">
    <div class="input-group input-group-sm">
    <input v-model="pmidQuery.value" class="form-control" placeholder="Enter PMID for searching" @click="openPopupAndSearch"/>
      <button _ngcontent-qeb-c162="" type="button" attr.aria-label="Search PubMed ID" class="btn btn-outline-secondary" disabled="">
        <font-awesome-icon :icon="faSearch" class="fa-fw fa-lg" />
      </button>
    </div>
    <!-- The Popup component -->
    <PmidPopUp
      v-if="showPopup"
      :pmid="pmidQuery.value"
      @select="handleSelect"
      @close="handleClose"
    />
  </div>
</template>
<!--:results="searchResults"-->

<script setup>
import { ref } from 'vue';
import PmidPopUp from './PmidPopUp.vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";


const props = defineProps(['fieldType','pmid', 'class', 'placeholder', 'row'])
const pmidQuery = ref(props.pmid);
const row = ref(props.row);
const showPopup = ref(false);
const loading = ref(false);
// const searchResults = ref([]);

function openPopupAndSearch() {
  if (pmidQuery.value.value) {
    showPopup.value = true;
  }
}

function handleSelect(selectedItem) {
  pmidQuery.value.value = selectedItem.id;
  if(Array.isArray(row.value)){
    row.value.forEach(item => {
      if(item.name === 'PMID')
        item.value = selectedItem.pmid;
      else if(item.name === 'Title')
        item.value = selectedItem.title;
      else if(item.name === 'Authors')
        item.value = selectedItem.authorString;
      else if(item.name === 'Year')
        item.value = selectedItem.pubYear;
      else if(item.name === 'Volume')
        item.value = selectedItem.journalVolume;
      else if(item.name === 'Issue')
        item.value = selectedItem.issue;
    })
  }
  row.value
  showPopup.value = false;
}

function handleClose() {
  showPopup.value = false;
}

// Mocking the fetch function, replace with actual API call

</script>
