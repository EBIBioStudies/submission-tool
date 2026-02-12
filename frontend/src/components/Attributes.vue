<script setup lang="ts">
import { computed, inject, Ref, ref, UnwrapRef } from 'vue';
import Attribute from '@/components/Attribute.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { addMissingAttributesGeneral } from '@/composables/useAttributesHelper';
import { PageTab } from '@/models/PageTab.model.ts';
import { Template } from '@/models/Template.model.ts';
import { AttributeExpose, ControlError, SectionExpose } from 'components/expose.model.ts';
import { isDefined } from '@/utils.ts';

const props = defineProps<{
  attributes?: PageTab.DetailedAttribute[],
  fieldTypes?: Template.FieldType[],
  allowNewAttribute?: boolean,
  isSectionAttribute?: boolean,
}>();
const emits = defineEmits<{
  deleteAttribute: [index: number]
  createTag: [obj: PageTab.Tag]
  deleteTag: [obj: PageTab.IndexedTag]
  newAttribute: []
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
  // const fieldType = props?.fieldTypes?.find(
  //   (f) => f.name?.toLowerCase() === attribute?.name?.toLowerCase(),
  // );
  // return fieldType ? fieldType : props?.attributes?.length > 1 ? attribute : '';
  return props?.fieldTypes?.find((f) => f.name?.toLowerCase() === attribute?.name?.toLowerCase());
};

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
          :isSectionAttribute="isSectionAttribute"
          @deleteAttribute="() => emits('deleteAttribute', index)"
          @deleteTag="(v) => emits('deleteTag', v)"
        />
      </template>
    </div>

    <div v-if="!(allowNewAttribute === false)" class="branch mt-2">
      <button
        v-if="parentDisplayType !== 'readonly'"
        class="btn btn-light btn-small text-black-50"
        @click="$emit('newAttribute')"
      >
        <font-awesome-icon
          :icon="['fas', 'plus']"
          class="icon fa-fw"
        ></font-awesome-icon>
        <i>New Attribute</i>
      </button>
    </div>
  </div>
</template>
