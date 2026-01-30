<template>
  <div class="form-control">
    <div class="input-group input-group-sm">
    <input v-model="pmidQuery.value" class="form-control" placeholder="Enter PMID for searching" @click="openPopupAndSearch" @input="openPopupAndSearch"/>
      <button type="button" attr.aria-label="Search PubMed ID" class="btn btn-outline-secondary" @click="openPopupAndSearch">
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

<script setup lang="ts">
import { ref } from 'vue';
import PmidPopUp from './PmidPopUp.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Template } from '@/models/Template.model.ts';
import { PageTab } from '@/models/PageTab.model.ts';
import { PublicationSearchResult } from 'components/PmidPopUp.vue';


const props = defineProps<{
  fieldType?: Template.FieldType,
  pmid: PageTab.Tag,
  class?: string,
  placeholder?: string,
  row: PageTab.DetailedAttribute[]
}>()
const pmidQuery = ref(props.pmid);
const row = ref(props.row);
const showPopup = ref(false);

function openPopupAndSearch() {
    showPopup.value = true;
}

function handleSelect(selectedItem: PublicationSearchResult) {
  pmidQuery.value.value = selectedItem.id;
  if(Array.isArray(row.value)){
    row.value.forEach(item => {
      if(item.name === 'PMID'){
        item.value = selectedItem.pmid;
        if(!selectedItem.pmid)
          item.value = selectedItem.id;
      }
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
      else if(item.name === 'Type')
        item.value = selectedItem.pubType;
      else if(item.name === 'Issn')
        item.value = selectedItem.journalIssn;
      else if(item.name === 'DOI')
        item.value = selectedItem.doi;
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
