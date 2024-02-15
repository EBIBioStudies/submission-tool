<script setup>
import {computed, ref} from "vue";
import SectionTable from "@/components/SectionTable.vue";

const props = defineProps(['section', 'sectionType']);

const thisSection = ref(props.section);
const authors = computed(() => {
  return thisSection?.value?.subsections?.filter((s) => s?.type?.toLowerCase() === 'author') ?? []
})
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
        :rows="authors"
        :depth="0"
        :sectionType="props.sectionType"
        sectionSubType="Contacts"
        :isTableAttribute="true"
        @rowsReordered=""
        @columnUpdated=""
        @columnsReordered=""
        @delete=""
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
