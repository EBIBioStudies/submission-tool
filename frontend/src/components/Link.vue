<script setup>
import {computed, inject, onMounted, ref, watch} from "vue";
import {SearchLinks, prefixToLinkMap} from "@/templates/links";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const props = defineProps(['fieldType','link', 'class', 'placeholder', 'row'])
const emits = defineEmits(['change'])
const thisLink = ref('')
const showSuggestions = ref(false);
const row = ref(props.row)
const filteredListItems = ref(null);
const parentDisplayType = inject('parentDisplayType')

const errors = computed(()=>getErrors());
const getErrors = () => {
  const _errors = []
  if(!isIdLink(thisLink.value) && !isUrl.value) {
    _errors.push('Please enter a valid url or link')
  }
    return _errors.length ? _errors.join('. ').trim() : null;
  }


const filterList = () =>
{
  // Filter myList based on the user's input
  let url = thisLink.value || ''
  filteredListItems.value =  SearchLinks(url).filter(item =>
    item.toLowerCase().includes(url.toLowerCase())
  );
    showSuggestions.value = filteredListItems.value.length >0;
};

const removeSuggestions = ()=>{
    showSuggestions.value = false;
}

onMounted(async () => {
  const attribute = row.value?.attributes?.find(att => att?.name === 'Type');
  const type = attribute ? attribute.value : undefined;
  let fullLink = type && (row?.value?.url!==(type+":")) ? `${type}:${row?.value?.url}` : row?.value?.url;
  thisLink.value = isIdLink(fullLink) ? fullLink : row?.value?.url
});

watch(thisLink, (newValue) => {
  row.value.url = newValue
  if(newValue && isIdLink(newValue)) {
    let parts = newValue.split(":");
    let urlType = parts[0];
    if(urlType === 'http' || urlType === 'https') {
      return
    }
    row.value.url = parts[1]?.trim();
    const typeAttribute = row.value?.attributes?.find(attr => attr.name === 'Type');
    if (typeAttribute) {
      typeAttribute.value = urlType;
    } else {
      if(!row.value?.attributes)
        row.value.attributes = [];
      row.value?.attributes.push({
        name: 'Type',
        value: urlType
      });
    }
  }

});

const selectItem = (item) =>{
  // Set the user input to the selected item and hide suggestions
  thisLink.value = item.endsWith(':') ? item : item + ':';
  showSuggestions.value = false;
}

const linkUrl = computed(()=>{
  if(thisLink.value && isIdLink(thisLink.value))
  {
    let parts = thisLink.value.split(":");
    let url = prefixToLinkMap[parts[0]];
    if(url && url.length>0 && parts[1])
      return url.replace('{0}', parts[1])
  }
  return '';
});

const isIdLink = ((value)=>{
  const IDENTIFIER_REGEXP = /^([\w\s].+):([\w\W]+)$/;
  return IDENTIFIER_REGEXP.test(value);
});

const isUrl = computed(()=>{
  const URL_REGEXP = /^(http|https|ftp):\/\/.+$/;
  return URL_REGEXP.test(thisLink.value);
})

defineExpose({errors});

</script>

<template>
  <div class="w-100 ">
    <div class="input-group input-group-sm dropdown">
      <input
        type="text"
        :disabled="parentDisplayType==='readonly'"
        class="form-control text-primary  dropdown-input"
        :class="props?.class"
        :placeholder="props?.placeholder"
        v-model="thisLink"
        @input="filterList"
        @focusin="filterList"
        @focusout="removeSuggestions"
      />
      <div class="input-group-append">
        <a :class="{ disabled:linkUrl.length==0 }" :href="linkUrl" class="lbtn btn btn-outline-secondary align-items-center" target="_blank">
          <img v-if="isIdLink(thisLink)" height="20" src="data:image/png;base64,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">
          <font-awesome-icon v-else class="fas fa-external-link-alt" :icon="['fas','fa-external-link-alt']"></font-awesome-icon>
        </a>
      </div>
      <div class="dropdown-menu show" v-if="showSuggestions">
          <a
                  v-for="(item, index) in filteredListItems"
                  :key="index"
                  class="dropdown-item"
                  @mousedown="selectItem(item)"
          >{{ item }}</a>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dropdown-menu {
    display: block; /* Make sure the dropdown is always shown when there are filtered items */
    position: absolute; /* Position the dropdown menu absolutely within its positioned parent */
    top: 100%; /* Align the top of the dropdown menu with the bottom of the parent container */
    left: 0;
    width: calc(100% - 45px);
    z-index: 1000; /* Ensure the dropdown is stacked above other content */
    max-height: 200px;
    overflow-y: auto;
}
.lbtn{
  --bs-btn-border-radius:none
}
</style>
