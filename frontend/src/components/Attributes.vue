<script setup lang="ts">
import { computed, inject, Ref, ref, UnwrapRef } from 'vue';
import Attribute from '@/components/Attribute.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { addMissingAttributesGeneral } from '@/composables/useAttributesHelper';
import { PageTab } from '@/models/PageTab.model.ts';
import { Template } from '@/models/Template.model.ts';
import { AttributeExpose, ControlError, SectionExpose } from '@/components/expose.model.ts';
import { isDefined } from '@/utils.ts';

const props = defineProps<{
  attributes?: PageTab.DetailedAttribute[],
  fieldTypes?: Template.Type[],
  annotationsType?: Template.AnnotationType,
  allowNewAttribute?: boolean,
  isSectionAttribute?: boolean,
}>();
const emits = defineEmits<{
  deleteAttribute: [attribute: PageTab.IndexedTag[]]
  createTag: [obj: PageTab.Tag]
  deleteTag: [obj: PageTab.IndexedTag]
  newAttribute: [type?: string]
}>();
const attributeList = ref(props.attributes);
const duplicateAttributes = attributeList.value?.filter(
  (value, _index, array) =>
    array.find((v) => v.name === value.name) !== value && value.name !== '',
);
const attributeRefs = ref<UnwrapRef<AttributeExpose>[]>([]);
const parentDisplayType = inject<Ref<Template.DisplayType>>('parentDisplayType');

const processed = (attribute: PageTab.DetailedAttribute) => duplicateAttributes?.includes(attribute);

const getFieldType = (attribute: PageTab.DetailedAttribute): Template.FieldType | undefined => {
  // First check in regular fieldTypes
  const fieldType = props?.fieldTypes?.find((f) => f.name?.toLowerCase() === attribute?.name?.toLowerCase());
  if (fieldType) return fieldType;

  // Then check in annotationsType.columnTypes
  if (props?.annotationsType?.columnTypes) {
    const annotationType = props.annotationsType.columnTypes.find(
      (f) => f.name?.toLowerCase() === attribute?.name?.toLowerCase(),
    );
    if (annotationType) return annotationType as Template.FieldType;
  }

  return undefined;
};

const nonPresentAttributes = computed(() =>
  [
    ...props.fieldTypes?.filter(f => !props.attributes?.some(a => a.name.toLowerCase() === f.name.toLowerCase())) || [],
    ...props.annotationsType?.columnTypes?.filter(f => !props.attributes?.some(a => a.name.toLowerCase() === f.name.toLowerCase())) || [],
    ...props.allowNewAttribute ? [{ name: '' }] : [],
  ],
);


// Check if attribute matches a regular fieldType (not annotation)
const isRegularAttribute = (attribute: PageTab.DetailedAttribute): boolean => {
  return props?.fieldTypes?.some(
    (f) => f.name?.toLowerCase() === attribute?.name?.toLowerCase(),
  ) ?? false;
};


const singleOptionHandle = (e: Event) => {
  if (nonPresentAttributes.value.length !== 1) return;
  e.preventDefault();
  emits('newAttribute', nonPresentAttributes.value[0].name)
}

const addMissingAttributes = () => {
  addMissingAttributesGeneral(attributeList, props.fieldTypes);
};

const errors = computed(() => attributeRefs.value
  .filter(att => isDefined(att.errors))
  .map(att => ({
    errorMessage: att.errors,
    control: att,
    element: document.getElementById(att.attributeId)!,
  }) as ControlError<UnwrapRef<AttributeExpose>>),
);

defineExpose<SectionExpose>({ errors });

addMissingAttributes();
</script>

<template>
  <div>
    <div v-for="(attribute, index) in attributeList" :key="index">
      <template v-if="!processed(attribute)">
        <Attribute
          :key="index"
          ref="attributeRefs"
          :attribute="attribute as PageTab.BuildingSection"
          :field-type="getFieldType(attribute)!"
          :parent="attributeList"
          @createTag="(v) => emits('createTag', v)"
          :isSectionAttribute="isSectionAttribute && isRegularAttribute(attribute)"
          @deleteAttribute="(att) => emits('deleteAttribute', att)"
          @deleteTag="(v) => emits('deleteTag', v)"
        />
      </template>
    </div>

    <template v-if="parentDisplayType !== 'readonly'">
      <div v-if="nonPresentAttributes.length" class="branch mt-2">
        <div class="btn btn-light btn-small text-black-50" data-bs-toggle="dropdown" @click="singleOptionHandle">
          <font-awesome-icon
            :icon="['fas', 'plus']"
            class="icon fa-fw"
          ></font-awesome-icon>
          <i>New Attribute</i>

          <ul class="dropdown-menu">
            <li v-for="(attribute, i) in nonPresentAttributes" :key="i"
                @click="$emit('newAttribute', attribute.name)"
                class="dropdown-item btn">
              <font-awesome-icon class="icon fa-fw" :icon="attribute.icon || 'fa-circle-dot'"></font-awesome-icon>
              <span v-if="attribute.name">{{ attribute.name }}</span>
              <i v-else>Custom attribute</i>
            </li>
          </ul>
        </div>
      </div>
    </template>

  </div>
</template>
