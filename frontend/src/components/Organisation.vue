<script setup lang="ts">
import Multiselect from '@vueform/multiselect';
import { inject, ref, Ref } from 'vue';
import axios from 'axios';
import { PageTab } from '@/models/PageTab.model.ts';
import { ROR } from '@/models/Organisation.model.ts';
import { Template } from '@/models/Template.model.ts';
import { Class, ensureArray } from '@/utils.ts';

const model = defineModel<any[]>();
const props = defineProps<{
  class?: Class,
  fieldType: Template.FieldType
}>();
const submission = inject<Ref<PageTab.LocalSubmission>>('submission');


const emits = defineEmits<{
  deleteOrg: [PageTab.Organisation],
  createOrg: [PageTab.Organisation]
}>();

// get organisation which matches the affiliation reference
const organisations = ref<Option[]>([]);
const parentDisplayType = inject<Ref<Template.DisplayType>>('parentDisplayType');


const updateOptions = async (query: string) => {
  if (!query || query.length < 3) return [];
  return axios<ROR.Organisations>({
    url: `ror/organizations?query=${query}`,
    headers: { 'content-type': 'application/json' },
    method: 'GET',
  }).then((response) =>
    mapRorItemsToOptionsUnique(response.data?.items).filter((entry) => {
      return (
        organisations.value.filter((org) => org?.label === entry.label)
          .length === 0
      );
    }),
  );
};

type Option = { value: string, label?: string, baseLabel?: string, locationName?: string, accno?: string };

// Build an array of { value, label } for the multiselect.
// - value: ROR organization ID
// - label: human-friendly name
// If more than one organization shares the same base label (acronym + display name),

// append the location name to the label to make each entry distinguishable.
const mapRorItemsToOptionsUnique = (items: ROR.Organisation[] = []) => {
  // Map<label, option[]>
  const optionsByLabel = new Map<string, Option[]>();

  // First pass: group options by their base label
  items.forEach((org) => {
    const id = org.id;

    const acronym = org.names?.find((n) => n.types?.includes('acronym'))?.value;

    const rorDisplay = org.names?.find((n) =>
      n.types?.includes('ror_display'),
    )?.value;

    const locationName = org.locations?.find(
      (loc) => loc.geonames_details?.name,
    )?.geonames_details?.name;

    const fallbackName =
      rorDisplay ||
      org.names?.find((n) => n.types?.includes('label'))?.value ||
      org.names?.[0]?.value;

    const baseLabel = acronym ? `${acronym} - ${fallbackName}` : fallbackName;

    const option = { value: id, baseLabel, locationName };

    const existing = optionsByLabel.get(baseLabel) ?? [];
    existing.push(option);
    optionsByLabel.set(baseLabel, existing);
  });

  // Second pass: disambiguate labels where needed
  const cleanedOptions: Option[] = [];

  optionsByLabel.forEach((optionsWithSameLabel) => {
    if (optionsWithSameLabel.length > 1) {
      // Duplicate base labels: append location name
      optionsWithSameLabel.forEach((opt) => {
        const suffix = opt.locationName ? ` - ${opt.locationName}` : '';
        cleanedOptions.push({
          value: opt.value,
          label: `${opt.baseLabel}${suffix}`,
        });
      });
    } else {
      // Unique base label: keep as-is
      const opt = optionsWithSameLabel[0];
      cleanedOptions.push({ value: opt.value, label: opt.baseLabel });
    }
  });

  return cleanedOptions;
};

organisations.value = model.value!
  .map((affiliation) => {
    const org = submission?.value.section.subsections?.flatMap(ensureArray)?.filter(
      (s) =>
        (s?.type?.toLowerCase() === 'organisation' ||
          s?.type?.toLowerCase() === 'organization') &&
        s?.accno === affiliation.value,
    )[0];
    const label = org?.attributes?.find((attr) => attr.name === 'Name')?.value!;
    const rorIdAttribute = org?.attributes?.find((attr) => attr.name === 'RORID');
    return {
      accno: affiliation.value!,
      label: label,
      value: rorIdAttribute?.value ? rorIdAttribute.value : label,
    };
  })
  .filter((option) => option.label && option.label !== '');
</script>

<template>
  <Multiselect
    mode="tags"
    no-options-text="Type+↵ to add"
    v-model="organisations"
    class="form-control form-control-sm org"
    :allow-empty="false"
    :class="props.class"
    :create-option="true"
    :searchable="true"
    :allow-absent="true"
    :options="async (q: string) => await updateOptions(q)"
    :object="true"
    :delay="0"
    :min-chars="3"
    :disabled="parentDisplayType === 'readonly'"
    :filter-results="false"
    :hide-selected="true"
    :can-clear="false"
    :append-to-body="true"
    @deselect="
      (v) => {
        emits('deleteOrg', v);
        return false;
      }
    "
    @create="
      (v: PageTab.Organisation) => {
        emits('createOrg', v);
        return false;
      }
    "
    @select="
      (v) => {
        emits('createOrg', v);
        return false;
      }
    "
  >
  </Multiselect>
</template>

<style scoped>
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
</style>
