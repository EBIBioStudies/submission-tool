<script setup lang="ts">

import { Template } from '@/models/Template.model.ts';
import { computed, inject, Ref, ref, watch } from 'vue';
import { Ontology } from '@/models/Ontology.model.ts';
import Multiselect from '@vueform/multiselect';
import { Class, isDefined } from '@/utils.ts';
import { PageTab } from '@/models/PageTab.model.ts';
import Let from '@/components/Let.vue';

const model = defineModel<PageTab.DetailedAttribute[]>({ default: [] });

const props = defineProps<{
  fieldType: Template.FieldType,
  class?: Class
}>();

const emits = defineEmits<{
  deleteTerm: [PageTab.IndexedTag],
  createTerm: [PageTab.Tag],
}>();

const controlType = computed(() => props.fieldType.controlType);
const mulitple = computed(() => controlType.value?.multiple ?? false);
const ontology = computed(() => controlType.value?.ontology);
const selectedEntries = ref<Option[] | Option | undefined>([]);
const parentDisplayType = inject<Ref<Template.DisplayType>>('parentDisplayType');

let lastQuery = '';
const allOptions = ref<Option[]>([]);
const updateOptions = async (search: string): Promise<Option[]> => {
  if (!search) {
    if (controlType.value?.defaultAll) search = '*';
    else {
      allOptions.value = [];
      return allOptions.value;
    }
  }

  if (lastQuery !== search) page.value = 0;
  else page.value++;

  lastQuery = search;
  const result = await Ontology.OLS4.search({
    search,
    ontologyId: ontology.value,
    size: controlType.value?.pageSize ?? 10,
    page: page.value,
    hierarchicalAncestor: controlType.value?.allChildrenOf,
    exactMatch: controlType.value?.exact,
    includeObsoleteEntities: controlType.value?.obsoletes,
    isDefiningOntology: controlType.value?.local,
  });
  const data = result.elements.map(e => ({
      value: {
        name: props.fieldType.name, value: e.label[0], valqual: [
          { name: 'Ontology', value: e.ontologyId },
          { name: 'TermId', value: e.shortForm },
        ],
      },
      label: e.label[0],
      definition: Ontology.OLS4.extractValue(e.definition?.[0] || ''),
    }),
  );

  totalPage.value = result.totalPages;
  if (page.value > 0 && lastQuery === search) allOptions.value.push(...data);
  else allOptions.value = data;
  return allOptions.value;
};

selectedEntries.value = model.value
  .filter(e => isDefined(e.value))
  .map(e => ({ value: e, label: e.value! }));
if (!mulitple.value) selectedEntries.value = selectedEntries.value.at(0);


type Option = { value: PageTab.DetailedAttribute, label: string, definition?: string };

const idToURL = (id: string) => `https://www.ebi.ac.uk/ols4/ontologies/${ontology.value}/classes?obo_id=${id.replace('_', ':')}`;

const onSelect = async (e: any) => {
  emits('createTerm', {...e.value, replace: !mulitple.value});
  return false;
};

const multiselect = ref<InstanceType<typeof Multiselect>>();
const page = ref(0);
const totalPage = ref(0);


const isLastPage = computed(() => page.value === totalPage.value - 1);

const infiniteTrigger = ref<HTMLElement | null>(null);
watch(infiniteTrigger, el => new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting && !isLastPage.value) multiselect.value?.refreshOptions(undefined);
}).observe(el!));

</script>

<template>
  <Multiselect ref="multiselect"
               :mode="controlType?.multiple ? 'tags' : 'single'"
               no-options-text="Type+↵ to add"
               v-model="selectedEntries"
               class="form-control form-control-sm org"
               :allow-empty="false"
               :class="props.class"
               :create-option="controlType?.enableValueAdd ?? false"
               :searchable="true"
               :allow-absent="true"
               :options="async (q: string) => await updateOptions(q)"
               :object="true"
               :delay="0"
               :disabled="parentDisplayType === 'readonly'"
               :multiple="controlType?.multiple ?? false"
               :filter-results="false"
               :hide-selected="true"
               :can-clear="false"
               :append-to-body="true"
               :classes="{dropdown: 'multiselect-dropdown ontology'}"
               @create="controlType?.enableValueAdd && $emit('createTerm', $event.value)"
               @deselect="$emit('deleteTerm', $event.value)"
               @select="onSelect"
  >
    <template v-slot:option="{option}">
      <Let :value="option.value.valqual?.find((qual: PageTab.Tag) => qual.name === 'TermId')?.value"
           v-slot="{ value: id }">
        <div v-tooltip="{ title: option.definition, placement: 'left' }">
          <span class="me-1">{{ option.label }}</span>
          <a v-if="id" :href="idToURL(id)" class="term">{{ id }}</a>
        </div>
      </Let>
    </template>
    <template v-slot:tag="{ option , handleTagRemove, disabled}">
      <span class="multiselect-tag" :class="{ 'multiselect-tag-disabled': disabled }">
        <span class="multiselect-tag-content">
          <Let :value="option.value.valqual?.find((qual: PageTab.Tag) => qual.name === 'TermId')?.value"
               v-slot="{ value: id }">
            <a v-if="id" :href="idToURL(id)" class="term">{{ option.label }}</a>
            <span v-else>{{ option.label }}</span>
          </Let>
        </span>
        <span class="multiselect-tag-remove" @click="handleTagRemove(option, $event)" v-if="!disabled">
          ×
        </span>
      </span>
    </template>
    <template v-slot:singlelabel="{ value }">
      <div class="multiselect-single-label">
        <Let :value="value.value.valqual?.find((qual: PageTab.Tag) => qual.name === 'TermId')?.value"
             v-slot="{ value: id }">
          <a v-if="id" :href="idToURL(id)" class="term">{{ value.label }}</a>
          <span v-else>{{ value.label }}</span>
        </Let>
      </div>
    </template>
    <template v-slot:afterlist>
      <div ref="infiniteTrigger" style="height: 5px;"></div>
    </template>
  </Multiselect>
</template>

<style scoped>
.term {
  text-decoration: underline;
}

.org {
  min-width: 120pt !important;
}
</style>
<style>
.org .multiselect-caret {
  margin: 0 0 !important;
}

.org .multiselect-search {
  padding-left: 0;
}

.ontology {
  --ms-max-height: 15rem;
}
</style>

