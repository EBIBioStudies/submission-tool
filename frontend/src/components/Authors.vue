<script setup>
import {computed, ref} from "vue";
import SectionTable from "@/components/SectionTable.vue";

const props = defineProps(['section', 'sectionType']);

const thisSection = ref(props.section);
const startCollapsed = ref(false);
const authors = computed(() => (thisSection?.value?.subsections?.filter((s) => s?.type?.toLowerCase() === 'author') ?? []));
const authorTableRef = ref()
const authorRefreshKey = ref(0);

const OnDeleteOrg = (o) => {
  // unlink the affiliation from author
  const affiliationIndex = authors.value[o.authorIndex].attributes.findIndex(attr => attr.name === 'affiliation' && attr.value === o.accno);
  authors.value[o.authorIndex]?.attributes.splice(affiliationIndex, 1);
  // delete organisation if no other author is affiliated
  if (!authors.value.some(author => author?.attributes.find(attr => attr.name === 'affiliation' && attr.value === o.accno))) {
    const orgIndex = thisSection?.value?.subsections?.findIndex(s => // can't use allOrgs here because index has to be of the subsection
      (s?.type?.toLowerCase() === 'organisation' || s?.type?.toLowerCase() === 'organization')
      && s?.accno === o.accno);
    thisSection?.value?.subsections?.splice(orgIndex, 1);
  }
  // refresh display
  startCollapsed.value = false;
  authorRefreshKey.value += 1;
  return false;
};

const orgWithAcc = (accno) => thisSection?.value?.subsections?.find(s =>
  (s?.type?.toLowerCase() === 'organisation' || s?.type?.toLowerCase() === 'organization')
  && s?.attributes?.some(a=> a.value===accno));

const OnCreateOrg = (o)=> {
  let org =  orgWithAcc(o.label);

  // if org does not exist, create it
  if (!org) {
    let nextOrgNumber = thisSection?.value?.subsections?.filter(s =>(s?.type?.toLowerCase() === 'organisation' || s?.type?.toLowerCase() === 'organization')).length+1;
    while (orgWithAcc(`o${nextOrgNumber}`)) nextOrgNumber++; // find the next empty accno
    const newOrg = {
      accno: `o${nextOrgNumber}`,
      attributes: [
        {
          name: "Name",
          value: o.label
        }
      ],
      "type": "organisation"
    }
    if (o.label!==o.value) newOrg.attributes.push({name:'RORID', value:o.value}); // add ror id if available
    thisSection?.value?.subsections?.push(newOrg)
    org = thisSection?.value?.subsections[thisSection?.value?.subsections?.length-1];
  }
  // assign it to the author
  authors.value[o.authorIndex].attributes.push({
      name: "affiliation",
      value: org.accno,
      reference: true
  })
  // refresh display
  startCollapsed.value = false;
  authorRefreshKey.value += 1;
  return false;
}

const reorderAuthors = (event)=>
{
  const authorIndexMap = {}; // lookup for index in authors to index in subsections
  let authIndex = 0;
  thisSection?.value?.subsections?.forEach( (section, i )=> {
    if (section?.type==='author') {
      authorIndexMap[authIndex] = i;
    }
  })
  thisSection?.value?.subsections?.splice( // insert in new index
    authorIndexMap[event.newIndex], 0,
    thisSection?.value?.subsections?.splice( // after removing from old index
      authorIndexMap[event.oldIndex], 1)[0]);

  authorRefreshKey.value +=1;
}
const columnsReordered = () => {
  authorRefreshKey.value +=1;
}

const errors = computed(() => authorTableRef?.value?.errors );

defineExpose({errors});

</script>

<template>
  <div>
    <div>
      <template v-for="author in authors">
        <div class="author">{{ author?.attributes?.find(a => a?.name?.toLowerCase() === 'name')?.value }}</div>
      </template>
    </div>
    <div>
      <SectionTable
        ref="authorTableRef"
        :key="authorRefreshKey"
        :rows="authors"
        :depth="0"
        :sectionType="props.sectionType"
        :startCollapsed = "startCollapsed"
        sectionSubType="Contacts"
        :isTableAttribute="true"
        @rowsReordered="reorderAuthors"
        @columnUpdated=""
        @columnsReordered="columnsReordered"
        @deleteOrg="OnDeleteOrg"
        @createOrg="OnCreateOrg"
      />
    </div>
  </div>
</template>

<style scoped>
.author {
  display: inline-block;
}

.author:not(:last-child):after {
  content: ', ';
  margin-right: 0.8em;
  color: #aaaaaa;
}
</style>
