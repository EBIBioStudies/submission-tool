<script setup lang="ts">

import { Template } from '@/models/Template.model.ts';
import axios from 'axios';
import { computed, inject, nextTick, Ref, ref, toRaw, watchEffect } from 'vue';
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
  deleteTerm: [PageTab.Tag],
  createTerm: [PageTab.Tag],
}>();

const mulitple = computed(() => props.fieldType.controlType?.multiple ?? false);
const ontology = computed(() => props.fieldType.controlType?.ontology);
const selectedEntries = ref<Option[] | Option | undefined>([]);
const parentDisplayType = inject<Ref<Template.DisplayType>>('parentDisplayType');

const updateOptions = async (search: string): Promise<Option[]> => {
  if (!search || search.length < 3) return [];
  return axios<Ontology.Results>({
    url: `${Ontology.URL}`,
    params: { search, ontologyId: ontology.value, size: 5, isDefiningOntology: true } as Ontology.Query,
    headers: { 'content-type': 'application/json' },
    method: 'GET',
  }).then((response) => {
      return response.data.elements.map(e => {
        return ({
          value: { name: props.fieldType.name, value: e.label[0], valqual: [{ name: 'id', value: e.curie }] },
          label: e.label[0],
          definition: Ontology.extractValue(e.definition?.[0] || ''),
        });
      }) as Option[];
    },
  );
};

selectedEntries.value = model.value
  .filter(e => isDefined(e.value))
  .map(e => ({ value: e, label: e.value! }));
if (!mulitple.value) selectedEntries.value = selectedEntries.value.at(0);


type Option = { value: PageTab.DetailedAttribute, label: string, definition?: string };

const idToURL = (id: string) => `https://www.ebi.ac.uk/ols4/ontologies/${ontology.value}/classes?obo_id=${id}`;

const onSelect = async (e: any) => {
  if (!mulitple.value && model.value[0]) emits('deleteTerm', model.value[0]);
  emits('createTerm', e.value);
  return false;
};

</script>

<template>
  <Multiselect
    :mode="fieldType.controlType?.multiple ? 'tags' : 'single'"
    no-options-text="Type+↵ to add"
    v-model="selectedEntries"
    class="form-control form-control-sm org"
    :allow-empty="false"
    :class="props.class"
    :create-option="fieldType.controlType?.enableValueAdd ?? false"
    :searchable="true"
    :allow-absent="true"
    :options="async (q: string) => await updateOptions(q)"
    :object="true"
    :delay="0"
    :min-chars="3"
    :disabled="parentDisplayType === 'readonly'"
    :multiple="fieldType.controlType?.multiple ?? false"
    :filter-results="false"
    :hide-selected="true"
    :can-clear="false"
    :append-to-body="true"
    :classes="{dropdown: 'multiselect-dropdown ontology'}"
    @create="$emit('createTerm', $event.value)"
    @deselect="$emit('deleteTerm', $event.value)"
    @select="onSelect"
  >
    <template v-slot:option="{option}">
      <Let :value="option.value.valqual?.find((qual: PageTab.Tag) => qual.name === 'id')?.value" v-slot="{ value: id }">
        <div v-tooltip="{ title: option.definition, placement: 'left' }">
          <span class="me-1">{{ option.label }}</span>
          <a v-if="id" :href="idToURL(id)" target="_blank" class="term">{{ id }}</a>
        </div>
      </Let>
    </template>
    <template v-slot:tag="{ option , handleTagRemove, disabled}">
      <span class="multiselect-tag" :class="{ 'multiselect-tag-disabled': disabled }">
        <span class="multiselect-tag-content">
          <Let :value="option.value.valqual?.find((qual: PageTab.Tag) => qual.name === 'id')?.value"
               v-slot="{ value: id }">
            <a v-if="id" :href="idToURL(id)" target="_blank" class="term">{{ option.label }}</a>
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
        <Let :value="value.value.valqual?.find((qual: PageTab.Tag) => qual.name === 'id')?.value"
             v-slot="{ value: id }">
          <a v-if="id" :href="idToURL(id)" target="_blank" class="term">{{ value.label }}</a>
          <span v-else>{{ value.label }}</span>
        </Let>
      </div>
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

