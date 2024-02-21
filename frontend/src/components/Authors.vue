<script setup>
import {computed, ref} from "vue";
import SectionTable from "@/components/SectionTable.vue";

const props = defineProps(['section', 'sectionType']);

const thisSection = ref(props.section);
const startCollapsed = ref(true)
const authors = ref(thisSection?.value?.subsections?.filter((s) => s?.type?.toLowerCase() === 'author') ?? []);
const authorRefreshKey = ref(0);
const OnDeleteOrg = (o)=> {
  authors.value[o.authorIndex]?.attributes.splice(o.index, 1);
  startCollapsed.value = false;
  authorRefreshKey.value += 1;
}
</script>

<template>
  <div>
    <div>
      <template v-for="author in authors">
        <div class="author">{{ author?.attributes?.find(a => a?.name?.toLowerCase() === 'name').value }}</div>
      </template>
    </div>
    <div>
      <SectionTable
        :key="authorRefreshKey"
        :rows="authors"
        :depth="0"
        :sectionType="props.sectionType"
        :startCollapsed = "startCollapsed"
        sectionSubType="Contacts"
        :isTableAttribute="true"
        @rowsReordered=""
        @columnUpdated=""
        @columnsReordered=""
        @deleteOrg="OnDeleteOrg"
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
