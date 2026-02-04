<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SectionTable from '@/components/SectionTable.vue';
import { addMissingAttributesGeneral } from '@/composables/useAttributesHelper';
import { Template } from '@/models/Template.model.ts';
import { PageTab } from '@/models/PageTab.model.ts';
import { ensureArray } from '@/utils.ts';

const props = defineProps<{
  section: PageTab.Section,
  sectionType: Template.TableType,
}>();
const hideNonRequiredColumns = props.sectionType.hideColumns || false;

const thisSection = ref(props.section);
const startCollapsed = ref(false); //TODO: change to true

onMounted(() => {
  if (!thisSection?.value?.subsections) return;

  thisSection.value.subsections
    .flatMap(ensureArray)

    .filter((s) => s.type?.toLowerCase() === 'author')
    .forEach((author) => {
      if (author.attributes && props.sectionType?.columnTypes) {
        const attributesRef = ref(author.attributes);
        addMissingAttributesGeneral(
          attributesRef,
          props.sectionType.columnTypes,
        );
        author.attributes = attributesRef.value; // update attributes with missing ones
      }
    });

  const authorsList = thisSection.value.subsections
    .flatMap(ensureArray)

    .filter((s) => s.type?.toLowerCase() === 'author');

  if (authorsList[0] && authorsList[0].accno?.includes('-init')) {
    authorsList[0].accno = authorsList[0].accno.replace('-init', '');
    let contact =
      props.sectionType?.name?.toLowerCase() === 'contact'
        ? props.sectionType
        : props.sectionType?.tableTypes?.find(
          (s) => s?.name?.toLowerCase() === 'contact', // TODO check s?.type should indeed be s?.name
        );
    if (!hideNonRequiredColumns) {
      const existingAttributeNames = authorsList[0].attributes!.map((attr) => attr.name);

      contact?.columnTypes?.forEach((column) => {
        if (
          !existingAttributeNames.includes(column.name) &&
          column?.name?.toLowerCase() !== 'organisation'
        ) {
          authorsList[0].attributes?.push({ name: column.name, value: '' });
        }
      });
    }
  }

  refresh(); // Trigger UI update if needed
});

const authors = computed(() => {
  // Just return filtered authors without mutation
  return (
    thisSection?.value?.subsections
      ?.flatMap(ensureArray)

      ?.filter(
      (s) => s?.type?.toLowerCase() === 'author',
    ) ?? []
  );
});

const authorTableRef = ref();
const authorRefreshKey = ref(0);
const OnDeleteOrg = (o: PageTab.Organisation) => {
  if (o?.accno === '') return;
  // unlink the affiliation from author
  let affiliationIndex = -1,
    totalAffiliations = 0;
  authors.value[o.authorIndex].attributes?.forEach((attr, i) => {
    if (attr.name?.toLowerCase() !== 'affiliation') return;
    if (attr.value === o.accno) affiliationIndex = i;
    totalAffiliations++;
  });

  // always keep an empty affiliation
  if (totalAffiliations === 1) {
    authors.value[o.authorIndex].attributes![affiliationIndex].value = '';
    delete (authors.value[o.authorIndex].attributes![affiliationIndex] as PageTab.ReferenceAttribute).reference;
  } else {
    authors.value[o.authorIndex].attributes?.splice(affiliationIndex, 1);
  }

  deleteUnusedOrganisations();
  return refresh();
};

const orgWithAcc = (accno: string): PageTab.Organisation | undefined =>
  thisSection?.value?.subsections?.flatMap(ensureArray)?.find(
    (s) =>
      (s?.type?.toLowerCase() === 'organisation' ||
        s?.type?.toLowerCase() === 'organization') &&
      s?.attributes?.some((a) => a.value === accno),
  ) as PageTab.Organisation | undefined;

const OnCreateOrg = (o: PageTab.Organisation) => {
  let org = orgWithAcc(o.label!);

  // if org does not exist, create it
  if (!org) {
    // find the highest existing organisation number
    const existingOrgNumbers = thisSection?.value?.subsections
      ?.flatMap(ensureArray)

      ?.filter(
        (s) =>
          s?.type?.toLowerCase() === 'organisation' ||
          s?.type?.toLowerCase() === 'organization',
      )
      .map((s) => {
        const match = s.accno?.match(/^o(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      }) || [];

    const maxOrgNumber =
      existingOrgNumbers.length > 0 ? Math.max(...existingOrgNumbers) : 0;
    let nextOrgNumber = maxOrgNumber + 1;

    // double-check that accno is truly unique
    while (orgWithAcc(`o${nextOrgNumber}`)) nextOrgNumber++;

    const newOrg = {
      accno: `o${nextOrgNumber}`,
      attributes: [
        {
          name: 'Name',
          value: o.label,
        },
      ],
      type: 'organisation',
    } as PageTab.Organisation;

    if (o.label !== o.value) {
      newOrg.attributes?.push({ name: 'RORID', value: o.value }); // add ROR ID if available
    }

    thisSection?.value?.subsections?.push(newOrg);
    org = thisSection?.value?.subsections?.at(-1) as PageTab.Organisation;
  }

  // delete empty org
  const emptyIndex = authors.value[o.authorIndex].attributes!.findIndex(
    (attr) => attr.name.toLowerCase() === 'affiliation' && attr.value === '',
  );

  if (emptyIndex !== -1)
    authors.value[o.authorIndex].attributes!.splice(emptyIndex, 1);

  // assign it to the author
  authors.value[o.authorIndex].attributes!.push({
    name: 'affiliation',
    value: org.accno,
    reference: true,
  });

  return refresh();
};

const reorderAuthors = (event: {newIndex: number, oldIndex: number}) => {
  const authorIndexMap: Record<number, number> = {}; // lookup for index in authors to index in subsections
  let authIndex = 0;
  thisSection?.value?.subsections?.flatMap(ensureArray)?.forEach((section, i) => {
    if (section?.type?.toLowerCase() === 'author') {
      authorIndexMap[authIndex++] = i;
    }
  });
  thisSection?.value?.subsections?.splice(
    // insert in new index
    authorIndexMap[event.newIndex],
    0,
    thisSection?.value?.subsections?.splice(
      // after removing from old index
      authorIndexMap[event.oldIndex],
      1,
    )[0],
  );

  return refresh();
};

const OnDeleteRow = (index: number) => {
  const authorIndexMap: Record<number, number> = {}; // lookup for index in authors to index in subsections
  let authIndex = 0;
  thisSection?.value?.subsections?.flatMap(ensureArray)?.forEach((section, i) => {
    if (section?.type?.toLowerCase() === 'author') {
      authorIndexMap[authIndex++] = i;
    }
  });

  //delete author section
  thisSection?.value?.subsections?.splice(authorIndexMap[index], 1);

  deleteUnusedOrganisations();
  return refresh();
};

const OnRowAdded = (row: PageTab.Section) => {
  thisSection?.value?.subsections?.push(row);
  return refresh();
};

const OnColumnUpdated = (row: { old: string, new: string, index: number }) => {
  thisSection?.value?.subsections?.flatMap(ensureArray)?.forEach((section) => {
    if (section?.type?.toLowerCase() !== 'author') return;
    section.attributes!.find((att) => att.name === row.old)!.name = row.new;
  });
  return refresh();
};

const deleteUnusedOrganisations = () => {
  const usedAffiliation = new Set();
  authors.value.forEach((author) => {
    author.attributes!.forEach((attr) => {
      if (attr.name?.toLowerCase() === 'affiliation' && attr.value !== '') {
        usedAffiliation.add(attr.value);
      }
    });
  });

  const indicesToRemove: number[] = [];
  thisSection?.value?.subsections?.flatMap(ensureArray)?.forEach((s, i) => {
    if (
      (s.type?.toLowerCase() === 'organisation' ||
        s.type?.toLowerCase() === 'organization') &&
      !usedAffiliation.has(s.accno)
    ) {
      indicesToRemove.push(i);
    }
  });
  indicesToRemove.sort((a, b) => b - a);
  indicesToRemove.forEach((orgIndex) =>
    thisSection?.value?.subsections?.splice(orgIndex, 1),
  );
};

const refresh = () => {
  startCollapsed.value = false;
  authorRefreshKey.value += 1;
  return false;
};

const errors = computed(() => authorTableRef?.value?.errors);

defineExpose({ errors });
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
        :startCollapsed="startCollapsed"
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
