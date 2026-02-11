<script setup lang="ts">
import {
  ComponentPublicInstance,
  computed,
  ComputedRef,
  getCurrentInstance,
  inject,
  nextTick,
  onMounted,
  ref,
  Ref,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Attributes from '@/components/Attributes.vue';
import SectionTable from '@/components/SectionTable.vue';
import SubsectionMenu from '@/components/SubsectionMenu.vue';
import { fillTemplate } from '@/templates/templates';
import utils, { ensureArray, isElement, isString } from '@/utils';
import SubSectionTable from '@/components/SubSectionTable.vue';
import EditableLabel from '@/components/EditableLabel.vue';
import Authors from '@/components/Authors.vue';
import { Tooltip } from 'bootstrap';
import { PageTab } from '@/models/PageTab.model.ts';
import { Template } from '@/models/Template.model.ts';
import Attribute from '@/components/Attribute.vue';
import { SectionExpose } from 'components/expose.model.ts';

const props = defineProps<{
  section: PageTab.Section;
  sectionType: Template.TableType | string;
  parentSectionType?: Template.TableType;
  depth: number;
  sectionTypeMap?: Map<string, Template.TableType>;
}>();

const emits = defineEmits<{
  delete: [msg?: { index: number }];
  addTable: [msg: { index: number, section: PageTab.Section, instance: Template.SectionType }];
}>();

const componentInstance = getCurrentInstance();

const attributesComponent = ref<ComponentPublicInstance<typeof Attribute>>();

const subsectionsRef = ref<HTMLDivElement[]>();
const sectionTablesRef = ref<HTMLDivElement[]>();
const sectionFilesRef = ref<ComponentPublicInstance<typeof SectionTable>>();
const sectionLinksRef = ref<ComponentPublicInstance<typeof SectionTable>>();
const parentDisplayType = inject<Ref<Template.DisplayType>>('parentDisplayType');
const isPublicSubmission = inject<ComputedRef<boolean>>('isPublicSubmission');
const collectionName = inject<Ref<string>>('collectionName');

const errSecRefs = ref<SectionExpose[]>([]);
const errSecTableRefs = ref<SectionExpose[]>([]);
const errSpecialSecTableRefs = ref<SectionExpose[]>([]);
const authorComponent = ref<typeof Authors>();

const thisSection = ref<PageTab.Section>(props.section);

const sectionType = computed(() =>
  isString(props.sectionType)
    ? props.sectionTypeMap!.get(props.sectionType.toLowerCase())!
    : props.sectionType,
);

const inheritedSectionType = computed(() => ({
  allowNewAttribute: props.parentSectionType?.allowNewAttribute,
  disableCustomSubsection: props.parentSectionType?.disableCustomSubsection,
  disableCustomTable: props.parentSectionType?.disableCustomTable,
  ...sectionType.value,
}));


const isRemovable = computed(() => sectionType.value?.display !== 'required' || thisSection.value.accno?.includes('-removable'));

const deleteTag = (msg: PageTab.IndexedTag) => deleteAttribute(msg.index);
// if (props?.sectionType?.display) {
//   provide('parentDisplayType', props?.sectionType?.display)
// }
// hack: variable to trigger re-rendering of attributes when needed
// TODO: figure out how to avoid this
const attributesRefreshKey = ref(0);
const sectionsRefreshKey = ref(0);

const subSectionTypeMap = props.sectionTypeMap
  ? props.sectionTypeMap
  : new Map<string, Template.TableType>();

!isString(props.sectionType) &&
props?.sectionType?.tableTypes?.forEach((tbType) => {
  if (tbType && tbType.name)
    subSectionTypeMap.set(tbType?.name?.toLowerCase(), tbType);
});


onMounted(() => {
  nextTick(() => {
    const tooltipElements = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );
    tooltipElements.forEach((el) => {
      // Dispose of any existing tooltip instance first (optional)
      const instance = Tooltip.getInstance(el);
      if (instance) instance.dispose();
      new Tooltip(el, { delay: { hide: 300, show: 0 }, trigger: 'hover' });
    });
  });
});

const renderedRowSections = new Set();
const getSectionsWithRowsAsSections = (type: string): PageTab.Section[] => {
  renderedRowSections.add(type?.toLowerCase());
  return thisSection.value.subsections?.flatMap(ensureArray)?.filter(
    (s) =>
      !Array.isArray(s) &&
      s?.type?.toLowerCase() === type.toLowerCase() &&
      subSectionTypeMap.get(type.toLowerCase())?.rowAsSection,
  ) || [];
};

const specialSectionMap = computed(() => {
  const curMap = new Map<string, PageTab.Section[]>();
  sectionType.value?.tableTypes?.forEach((tbType) => {
    const combined = getSectionsWithRowsAsSections(tbType.name);
    if (combined?.length) {
      curMap.set(tbType.name, combined);
    }
  });
  return curMap;
});

/**
 * Updates the subSectionTypeMap by matching subsections in props.section.subsections
 * with their corresponding type objects from sectionTypes and tableTypes.
 *
 * This method reads from component props and populates the subSectionTypeMap accordingly.
 * It normalizes subsection types, replacing 'author' with 'contact' for mapping.
 *
 * The map keys are the lowercase subsection types, and values are the matching type objects.
 *
 * Does not return a value; updates the map as a side effect.
 */
const updateSubSectionTypeMap = () => {
  const subsections = props.section?.subsections ?? [];
  const sectionTypes = sectionType.value?.sectionTypes ?? [];
  const tableTypes = sectionType.value?.tableTypes ?? [];

  const allTypes = [...sectionTypes, ...tableTypes];

  subsections.forEach((s) => {
    const subsection = Array.isArray(s) ? s[0] : s;

    const typeName =
      subsection?.type?.toLowerCase() === 'author'
        ? 'contact'
        : subsection?.type?.toLowerCase();

    const type = allTypes.find((f) => f?.name?.toLowerCase() === typeName)!;

    subSectionTypeMap.set(subsection?.type?.toLowerCase(), type);
  });
};

updateSubSectionTypeMap();

const isCollapsed = ref((props?.depth ?? 0) >= 2);

// children are not allowed to change properties of a parent
// all section/attributes updates thus need to be at this level
const addSubsection = async (aSection: PageTab.Section, _i: number, type?: Template.SectionType) => {
  if (parentDisplayType?.value === 'readonly') return;
  aSection.subsections = aSection.subsections || [];
  const obj = {} as PageTab.Section;
  if (type != null) fillTemplate(obj, type);
  else {
    obj.accno =
      (props.section.accno ?? Date.now()) +
      '-' +
      (props.section.subsections!.length + 1);
    obj.type = '';
  }
  obj.accno = String(obj.accno) + '-removable';

  if (!obj.type) obj.type = 'Custom section';
  aSection.subsections.push(obj);

  // Make sure the map with subsections is updated
  updateSubSectionTypeMap();

  sectionsRefreshKey.value += 1;

  // wait till the UI is updated and the focus the first attribute name
  await nextTick();
  const added = [
    ...(componentInstance?.refs?.sectionTablesRef as HTMLDivElement[] || []),
    ...(componentInstance?.refs?.subsectionsRef as HTMLDivElement[] || []),
  ].pop();

  added?.scrollIntoView();
  added?.querySelector('input')?.focus();
  // Expand section if collapsed
  if (added?.querySelector('.section-block')?.classList.contains('collapsed'))
    (added!.querySelector('.section-title') as HTMLDivElement).click();
};

const findLastInput = (item: HTMLElement | ComponentPublicInstance): HTMLInputElement => {
  let added = isElement(item) ? item : item.$el;
  return added?.querySelector('input');
  // const lastInput = inputs && inputs.length > 1 ? inputs[inputs.length - 2] : inputs[0];
};

const findAddedSection = (type?: string) => {
  let added;
  if (type === 'Link') added = sectionLinksRef.value;
  else if (type === 'File') added = sectionFilesRef.value;
  else if (type == 'Contact') added = authorComponent.value;
  if (added) return added.$el;

  if (type)
    added = [
      ...(sectionTablesRef.value || []),
      ...(subsectionsRef.value || []),
    ]
      ?.filter((item) => item?.innerText?.includes(type))
      ?.pop();
  else
    added = [
      ...(sectionTablesRef.value || []),
      ...(subsectionsRef.value || []),
    ].pop();

  return added;
};

const addTable = async (aSection: PageTab.BuildingSection, _i: number, type?: Template.SectionType) => {
  // if (type?.name?.toLowerCase()==='contact')
  //   authorComponent.add
  //   return
  if (parentDisplayType?.value === 'readonly') return;
  aSection.subsections = aSection.subsections || [];
  let obj = {} as PageTab.BuildingSection;
  if (type != null) fillTemplate(obj, type);
  else {
    obj.accno =
      (props.section.accno ?? Date.now()) +
      '-' +
      (props.section.subsections!.length + 1);
    obj.type = 'Table';
    obj.attributes = [{ name: 'Column 1', value: '' }];
  }
  obj.accno = String(obj.accno) + '-removable';
  if (type?.name === 'Link')
    aSection.links ? aSection.links.push(obj as PageTab.Link) : (aSection.links = [obj as PageTab.Link]);
  else if (type?.name === 'File')
    aSection.files ? aSection.files.push(obj as PageTab.File) : (aSection.files = [obj as PageTab.File]);
  else {
    if (type?.name === 'Contact') {
      obj.type = 'Author';
      obj?.attributes?.forEach((attribute) => {
        if (attribute.name === 'Organisation') {
          attribute.name = 'affiliation';
        }
      });
    }
    type ? aSection.subsections.push(obj) : aSection.subsections.push([obj]);
  }

  // obj = (type?.name !== 'Publication' && type?.name !== 'Funding') ? [obj] : obj;
  // aSection.subsections.splice(i, 0, obj);

  sectionsRefreshKey.value += 1;

  // wait till the UI is updated and the focus the first attribute name
  await nextTick();
  const added = findAddedSection(type?.name);
  //[...componentInstance.refs.sectionsComponent][0]
  added?.scrollIntoView();
  findLastInput(added)?.focus();

  // Expand section if collapsed
  if (added?.querySelector('.section-block')?.classList.contains('collapsed'))
    added?.querySelector('.section-title').click();
};

const deleteSubSection = async (someSubSections: PageTab.BuildingSection[], index: number) => {
  if (parentDisplayType?.value === 'readonly') return;

  if (
    !(await utils.confirm(
      'Delete Section',
      `Do you want to delete the section ${someSubSections[index].type}?`,
      { okayLabel: 'Delete' },
    ))
  )
    return;

  const subsectionTypeMapKey = someSubSections[index].type?.toLowerCase();
  thisSection.value.subsections = someSubSections.filter((_v, i) => i !== index);
  thisSection.value.subsections = thisSection.value.subsections.filter(
    (sub) => !(Array.isArray(sub) && sub.length === 0),
  );
  sectionsRefreshKey.value += 1;
  // Update the map so it does not contain the subsection that was just deleted
  subSectionTypeMap.delete(subsectionTypeMapKey);
};

const refreshSection = async () => {
  const secArray = thisSection.value.subsections || [];

  // Remove empty subsection arrays in the other case they will create exception in backend
  thisSection.value.subsections = secArray.filter(
    (sub) => !(Array.isArray(sub) && sub.length === 0),
  );

  sectionsRefreshKey.value += 1;
};

const addAttribute = async () => {
  if (parentDisplayType?.value === 'readonly') return;
  thisSection.value.attributes = thisSection.value.attributes || [];
  thisSection.value.attributes.push({ name: '', value: '' });
  attributesRefreshKey.value += 1;
  await nextTick();
  const added = [
    ...attributesComponent.value!.$el.querySelectorAll('.attribute-name'), // TODO check is valid
  ].pop();
  added.scrollIntoView();
  added.focus();
};

const deleteAttribute = async (index: number) => {
  if (parentDisplayType!.value === 'readonly') return;
  thisSection.value.attributes?.splice(index, 1);
  attributesRefreshKey.value += 1;
};

const createTag = (msg: PageTab.Tag) => {
  if (parentDisplayType!.value === 'readonly') return;
  thisSection.value.attributes = thisSection.value.attributes || [];
  // insert next to the last attribute with the same name
  // just to keep the structure cleaner
  let lastIndex = thisSection.value.attributes
    .map((a) => a.name)
    .lastIndexOf(msg.name);
  lastIndex =
    lastIndex === -1 ? thisSection.value.attributes.length : lastIndex;

  // fill in the value if it's the last tag -- add a new one otherwise
  if (thisSection.value.attributes[lastIndex].value === '') {
    thisSection.value.attributes[lastIndex].value = msg.value;
  } else {
    thisSection.value.attributes.splice(lastIndex + 1, 0, {
      name: msg.name,
      value: msg.value,
    });
  }
  attributesRefreshKey.value += 1;
};

const rowsReordered = <T>(event: {
  newIndex: number;
  oldIndex: number;
}, rows: T[]) => {
  if (parentDisplayType?.value === 'readonly') return;
  rows.splice(event.newIndex, 0, rows.splice(event.oldIndex, 1)[0]);
  sectionsRefreshKey.value += 1;
};

const columnsReordered = () => {
  sectionsRefreshKey.value += 1;
};

const canUpdateColumnName = (subsection: PageTab.BuildingSection | PageTab.BuildingSection[]) => {
  const subsectionType = Array.isArray(subsection)
    ? subsection[0]?.type
    : subsection?.type;

  return (
    parentDisplayType?.value !== 'readonly' ||
    (
      subsectionType?.toLowerCase() == 'publication' &&
      collectionName?.value == 'ArrayExpress'
    )
  );
};

const updateColumnName = (subsection: PageTab.BuildingSection[], update: { old: string; new: string; }) => {

  if (!canUpdateColumnName(subsection)) {
    return;
  }

  subsection.forEach(
    (row) =>
      row.attributes!.find((att) => att.name === update.old)!.name = update.new,
  );
  sectionsRefreshKey.value += 1;
};

const NOT_RENDERABLE = new Set(['author', 'organisation', 'organization']);
const canRender = (sec?: PageTab.BuildingSection | PageTab.BuildingSection[]): boolean => {
  if (!sec || Array.isArray(sec)) return true;
  return !NOT_RENDERABLE.has(sec?.type?.toLowerCase()!);
};

const errors = computed(() => {
  let _errors = [
    ...(authorComponent.value?.errors ?? []),
    ...attributesComponent.value?.errors,
  ];
  if (sectionFilesRef) {
    _errors = [..._errors, ...(sectionFilesRef?.value?.errors ?? [])];
  }
  if (sectionLinksRef) {
    _errors = [..._errors, ...(sectionLinksRef?.value?.errors ?? [])];
  }
  // validate subsections
  [
    ...errSpecialSecTableRefs.value,
    ...errSecRefs.value,
    ...errSecTableRefs.value,
  ].forEach((subsec) => {
    if (!canRender(subsec.thisSection)) return;
    _errors = [..._errors, ...subsec?.errors];
  });

  return _errors;
});

defineExpose<SectionExpose>({ errors, thisSection });

</script>

<template>
  <div
    v-if="canRender(props.section)"
    class="section-block pb-2"
    :class="{ collapsed: isCollapsed }"
  >
    <div v-if="section?.type === 'Study'" :key="sectionsRefreshKey">
      <Authors
        v-if="section"
        :section="section"
        :sectionType="
          sectionType?.tableTypes?.find(
            (s) => s.name.toLowerCase() === 'contact',
          )!
        "
        ref="authorComponent"
      />
    </div>
    <!-- section title -->
    <div class="align-text-bottom">
      <span
        class="col"
        :class="[depth > 0 ? 'branch' : 'branch spacer']"
      ></span>
      <span
        class="input-group-text text-start btn btn-lg ps-1 mt-2 section-title"
        @click="isCollapsed = !isCollapsed"
      >
        <font-awesome-icon
          class="section-control"
          :icon="'fa-caret-' + (isCollapsed ? 'right' : 'down')"
        ></font-awesome-icon>
        <span
          v-if="!isRemovable || inheritedSectionType?.disableCustomSubsection"
          class="ms-2"
          :data-bs-toggle="sectionType?.description ? 'tooltip' : false"
          data-bs-html="true"
          :data-bs-title="sectionType?.description"
        ><font-awesome-icon
          v-if="sectionType?.icon"
          class="icon"
          :icon="sectionType?.icon"
        />{{ section.type }}</span
        >
        <span v-else>
          <EditableLabel
            class="ms-2"
            @click.stop=""
            type="text"
            placeholder="Enter section type"
            :is-editable="true"
            :data="thisSection"
          />
        </span>
      </span>
      <span
        v-if="
          isRemovable &&
          parentDisplayType !== 'readonly' &&
          sectionType?.name !== 'Study' &&
          !isPublicSubmission
        "
        class="mt-2 btn btn-sm btn-delete"
        role="button"
      >
        <font-awesome-icon
          role="button"
          @click="$emit('delete')"
          @click.stop=""
          icon="fa-trash"
        ></font-awesome-icon>
      </span>
      <span
        v-if="depth === 0"
        class="float-end text-secondary"
        style="font-size: 8pt; padding-top: 35px"
      >* Required</span
      >
    </div>
    <!-- section content -->
    <transition name="slide">
      <div :class="{ 'visually-hidden': isCollapsed }">
        <div class="has-child-section ms-3 slide-in">
          <!-- attributes -->
          <Attributes
            :key="attributesRefreshKey"
            ref="attributesComponent"
            :attributes="section.attributes!"
            :fieldTypes="sectionType?.fieldTypes || sectionType?.columnTypes!"
            :isSectionAttribute="
              !(subSectionTypeMap.get(sectionType?.name?.toLowerCase() || '')?.rowAsSection)
            "
            :allow-new-attribute="inheritedSectionType.allowNewAttribute"
            @deleteAttribute="deleteAttribute"
            @createTag="createTag"
            @deleteTag="deleteTag"
            @newAttribute="addAttribute"
          />

          <div class="p-0" :key="sectionsRefreshKey">
            <!-- Files -->
            <SectionTable
              v-if="section.files && Array.isArray(section.files) && section.files.length > 0"
              :rows="section.files as PageTab.BuildingSection[]"
              :depth="props.depth + 1"
              :sectionType="subSectionTypeMap.get('file')!"
              sectionSubType="File"
              fixed-first-column
              @rowsReordered="(e) => rowsReordered(e, section.files!)"
              @columnUpdated="(msg) => updateColumnName(section.files as PageTab.BuildingSection[], msg)"
              @columnsReordered="columnsReordered"
              @delete="deleteSubSection(section.files as PageTab.BuildingSection[], 0)"
              @refreshSection="refreshSection()"
              ref="sectionFilesRef"
            />

            <!-- Links -->
            <SectionTable
              v-if="section.links && section.links?.length > 0"
              :rows="section.links as PageTab.BuildingSection[]"
              :depth="props.depth + 1"
              :sectionType="subSectionTypeMap.get('link')!"
              sectionSubType="Link"
              fixed-first-column
              @rowsReordered="(e) => rowsReordered(e, section.links!)"
              @columnUpdated="(msg) => updateColumnName(section.links as PageTab.BuildingSection[], msg)"
              @columnsReordered="columnsReordered"
              @delete="deleteSubSection(section.links as PageTab.BuildingSection[], 0)"
              @refreshSection="refreshSection()"
              ref="sectionLinksRef"
            />
            <!--            render special sections in the computed specialSectionMap -->
            <div
              v-for="(item, index) in specialSectionMap"
              :key="index"
              ref="sectionTablesRef"
            >
              <SubSectionTable
                v-if="Array.isArray(item[1]) && item[1]?.length > 0"
                :rows="item[1]"
                :depth="props.depth + 1"
                :sectionType="subSectionTypeMap.get(item[0].toLowerCase())!"
                :sectionSubType="item[0]"
                :parent="section"
                @rowsReordered="(e) => rowsReordered(e, item[1])"
                @columnUpdated="(msg) => updateColumnName(item[1], msg)"
                @columnsReordered="columnsReordered"
                @delete="deleteSubSection(section.subsections as PageTab.BuildingSection[], index)"
                @refreshSection="refreshSection()"
                ref="errSpecialSecTableRefs"
              />
            </div>

            <!-- render general Sections and general Tables -->
            <div
              v-for="(subsection, i) in section.subsections"
              :key="i"
              ref="subsectionsRef"
            >
              <!-- general section -->
              <Section
                v-if="
                  !Array.isArray(subsection) &&
                  !subSectionTypeMap.get(subsection?.type?.toLowerCase())
                    ?.rowAsSection
                "
                :section="subsection"
                :sectionType="
                  subSectionTypeMap.get(subsection?.type?.toLowerCase()) ||
                  subsection?.type?.toLowerCase()
                "
                :parentSectionType="inheritedSectionType"
                :depth="props.depth + 1"
                :sectionTypeMap="subSectionTypeMap"
                @delete="deleteSubSection(section.subsections as PageTab.BuildingSection[], i)"
                @addTable="(msg) => addTable(msg.section, i, msg.instance)"
                ref="errSecRefs"
              />

              <!-- general Table -->
              <SectionTable
                v-if="Array.isArray(subsection) && subsection?.length > 0"
                :rows="subsection"
                :depth="props.depth + 1"
                :sectionType="subSectionTypeMap.get(subsection[0]?.type?.toLowerCase())!"
                :sectionSubType="
                  subSectionTypeMap.get(subsection[0]?.type?.toLowerCase())?.name
                "
                :parent="section"
                @rowsReordered="(e) => rowsReordered(e, subsection)"
                @columnUpdated="(msg) => updateColumnName(subsection, msg)"
                @columnsReordered="columnsReordered"
                @delete="deleteSubSection(section.subsections as PageTab.BuildingSection[], i)"
                @refreshSection="refreshSection()"
                ref="errSecTableRefs"
              />
            </div>
            <SubsectionMenu
              :sectionType="inheritedSectionType"
              @newSection="(type?: Template.SectionType) => addSubsection(section, 1, type)"
              @newTable="(type?: Template.SectionType) => addTable(section, 1, type)"
            ></SubsectionMenu>

            <!-- Subsections end -->
          </div>
        </div>
      </div>
    </transition>
  </div>
  <!-- end rendered section -->
  <div v-else class="section-block"></div>
</template>

<style>
.plus-icon {
  color: #dedede;
}

.plus-icon:hover,
.plus-icon.show {
  color: #bcbcbc;
}

.btn-delete {
  padding-top: 7px;
  opacity: 0.6;
}

.btn-delete:hover {
  color: var(--bs-danger);
  opacity: 1;
}
</style>
