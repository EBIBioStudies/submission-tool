<script setup>
import {computed, onMounted, ref} from "vue";
import SectionTable from "@/components/SectionTable.vue";

const props = defineProps(['section', 'sectionType']);
const hideNonRequiredColumns = props.sectionType.hideColumns || false;

const thisSection = ref(props.section);
const startCollapsed = ref(false); //TODO: change to true
const authors = computed(() => {
  let authors = thisSection?.value?.subsections?.filter((s) => s?.type?.toLowerCase() === 'author') ?? [];
  if (authors[0] && authors[0]?.accno?.includes('-init')) {
    authors[0].accno = authors[0].accno.replace('-init', "")
    let contact = props.sectionType?.name?.toLowerCase() === 'contact' ? props.sectionType : props.sectionType?.tableTypes?.filter(s => s?.type?.toLowerCase() === 'contact');
    if(!hideNonRequiredColumns) {
      let existingAttributeNames = authors[0].attributes.map(attr => attr.name);
      contact.columnTypes.forEach(column => {
        if (!existingAttributeNames.includes(column.name) && column?.name?.toLowerCase() !== 'organisation') {
          authors[0].attributes.push({name: column.name, value: ""});
        }
      });
    }
  }
  return (authors??[])

});
const authorTableRef = ref()
const authorRefreshKey = ref(0);
const OnDeleteOrg = (o) => {
  if (o?.accno==='') return;
  // unlink the affiliation from author
  let affiliationIndex = -1, totalAffiliations =0;
  authors.value[o.authorIndex].attributes.forEach ((attr,i) => {
    if (attr.name?.toLowerCase() !== 'affiliation') return;
    if (attr.value === o.accno) affiliationIndex = i;
    totalAffiliations++;
  });

  // always keep an empty affiliation
  if (totalAffiliations===1) {
    authors.value[o.authorIndex].attributes[affiliationIndex].value = '';
    delete authors.value[o.authorIndex].attributes[affiliationIndex].reference;
  } else {
    authors.value[o.authorIndex].attributes.splice(affiliationIndex, 1);
  }

  deleteUnusedOrganisations();
  return refresh();
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

  // delete empty org
  const emptyIndex = authors.value[o.authorIndex].attributes.findIndex( attr=> attr.name.toLowerCase()==='affiliation' && attr.value==='');
  if (emptyIndex!==-1) authors.value[o.authorIndex].attributes.splice(emptyIndex,1);

  // assign it to the author
  authors.value[o.authorIndex].attributes.push({
    name: "affiliation",
    value: org.accno,
    reference: true
  })

  return refresh();
}

const reorderAuthors = (event)=>
{
  const authorIndexMap = {}; // lookup for index in authors to index in subsections
  let authIndex = 0;
  thisSection?.value?.subsections?.forEach( (section, i )=> {
    if (section?.type?.toLowerCase()==='author') {
      authorIndexMap[authIndex++] = i;
    }
  })
  thisSection?.value?.subsections?.splice( // insert in new index
    authorIndexMap[event.newIndex], 0,
    thisSection?.value?.subsections?.splice( // after removing from old index
      authorIndexMap[event.oldIndex], 1)[0]);

  return refresh();
}

const OnDeleteRow = (index)=>
{
  const authorIndexMap = {}; // lookup for index in authors to index in subsections
  let authIndex = 0;
  thisSection?.value?.subsections?.forEach( (section, i )=> {
    if (section?.type?.toLowerCase()==='author') {
      authorIndexMap[authIndex++] = i;
    }
  })

  //delete author section
  thisSection?.value?.subsections?.splice(authorIndexMap[index], 1);

  deleteUnusedOrganisations();
  return refresh();
}

const OnRowAdded = row => {
  thisSection?.value?.subsections?.push(row);
  return refresh();
}

const OnColumnUpdated = row => {
  thisSection?.value?.subsections?.forEach(section => {
    if (section?.type?.toLowerCase()!=='author') return;
    section.attributes.find((att) => att.name === row.old).name = row.new;
  })
  return refresh();
}


const deleteUnusedOrganisations = () => {
  const usedAffiliation = new Set();
  authors.value.forEach( author => {
    author.attributes.forEach(attr => {
      if (attr.name?.toLowerCase() === 'affiliation' && attr.value!=='') {
        usedAffiliation.add(attr.value)
      }
    })
  })

  const indicesToRemove = []
  thisSection?.value?.subsections?.forEach((s,i) => {
    if ( (s.type?.toLowerCase() === 'organisation' || s.type?.toLowerCase() === 'organization') && !usedAffiliation.has(s.accno)) {
      indicesToRemove.push(i);
    }
  })
  indicesToRemove.sort( (a,b)=> b-a);
  indicesToRemove.forEach(orgIndex => thisSection?.value?.subsections?.splice(orgIndex, 1));

}

const refresh = () => {
  startCollapsed.value = false;
  authorRefreshKey.value +=1;
  return false;
}

const errors = computed(() => authorTableRef?.value?.errors );

defineExpose({errors});

</script>

<template>
  <div>
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
        title="Contacts"
        @rowsReordered="reorderAuthors"
        @columnUpdated="OnColumnUpdated"
        @columnsReordered="refresh"
        @deleteOrg="OnDeleteOrg"
        @createOrg="OnCreateOrg"
        @deleteRow="OnDeleteRow"
        @rowAdded="OnRowAdded"
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
