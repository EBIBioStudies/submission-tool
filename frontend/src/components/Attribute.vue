<script setup>
import { computed, ref } from 'vue';
import Multiselect from '@vueform/multiselect';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps(['attribute', 'fieldType', 'parent']);
const emits = defineEmits(['createTag', 'deleteTag']);
const thisAttribute = ref(props.attribute);
const thisMultivalueAttribute = ref(
  props.parent
    ?.map((a, i) => {
      // save the original index -- needed when deleting
      return { index: i, ...a };
    })
    ?.filter(
      (a) =>
        a.name === thisAttribute.value.name && thisAttribute.value.value !== '',
    ),
);

function isString(val) {
  return typeof val === 'string' || val instanceof String;
}

const getAttributesFromFieldType = (fieldType) => {
  return (fieldType?.controlType?.values ?? []).map((val) =>
    isString(val)
      ? { name: fieldType.name, value: val }
      : { name: fieldType.name, ...val },
  );
};

const getAttributesNotInFieldType = (fieldType, parent) => {
  return parent?.filter(
    (a) =>
      a.name.toLowerCase() === props.attribute.name.toLowerCase() &&
      fieldType?.controlType?.values?.filter((val) => {
        const v = isString(val) ? val : val.value;
        return v.toLowerCase() === props.attribute.name.toLowerCase();
      }).length === 0,
  );
};

const mergeAttributeArraysByValue = (a, b) => {
  const aValues = a.map((obj) => obj.value);
  return [...(a ?? []), ...b.filter((o) => !aValues.includes(o.value))];
};

const singleSelectValues = computed(() => {
  const merged = mergeAttributeArraysByValue(
    getAttributesFromFieldType(props.fieldType),
    getAttributesNotInFieldType(props.fieldType, props.parent),
  );
  return merged;
});

const onChangeSelect = (newValue, control) => {
  // TODO: Figure out a way to bind the selected option instead of copying the individual properties
  const selected = control.options.find((o) => o.value === newValue);
  thisAttribute.value.valqual = selected?.valqual;
};

const onCreateTag = (newTag) => {
  // TODO: handle valqual
  const obj = { name: props.fieldType.name, value: newTag.value ?? newTag };
  emits('createTag', obj);
  return false; // ignore the event, it will be rendered by the parent
};

const onDeleteTag = (newTag) => {
  const obj = {
    name: props.fieldType.name,
    value: newTag.value,
    index: newTag.index,
  };
  emits('deleteTag', obj);
  return false; // ignore the event, it will be rendered by the parent
};
</script>

<template>
  <!--label-->
  <label class="input-group-text">
    <font-awesome-icon
      v-if="fieldType?.icon"
      class="icon"
      :icon="fieldType?.icon"
    ></font-awesome-icon>
    <font-awesome-icon
      v-else
      class="icon"
      inverse
      icon="fa-check"
    ></font-awesome-icon>
    <span class="text-muted" v-if="fieldType">{{ fieldType.name }}</span>
    <span v-else>
      <input
        class="input-group-text text-start d-inline-block"
        v-model="thisAttribute.name"
        placeholder="Attribute name"
      /><font-awesome-icon
        class="icon"
        icon="fa-edit"
        transform="shrink-4"
      ></font-awesome-icon>
    </span>
  </label>

  <!--largetext-->
  <textarea
    v-if="fieldType?.controlType?.name === 'largetext'"
    type="text"
    class="form-control"
    rows="3"
    :placeholder="fieldType?.controlType?.placeholder"
    v-model="thisAttribute.value"
  ></textarea>

  <!-- select  -->
  <Multiselect
    v-else-if="
      fieldType?.controlType?.name === 'select' &&
      !fieldType?.controlType?.multiple
    "
    :allow-absent="fieldType?.controlType?.enableValueAdd ?? true"
    v-model="thisAttribute.value"
    label="value"
    class="form-control"
    :searchable="true"
    :options="singleSelectValues"
    @change="onChangeSelect"
  >
  </Multiselect>

  <!-- tags  -->
  <Multiselect
    v-else-if="
      fieldType?.controlType?.name === 'select' &&
      fieldType?.controlType?.multiple
    "
    v-model="thisMultivalueAttribute"
    mode="tags"
    label="value"
    class="form-control"
    :searchable="true"
    :createOption="fieldType?.controlType?.enableValueAdd ?? true"
    :allowAbsent="fieldType?.controlType?.enableValueAdd ?? true"
    :options="singleSelectValues"
    noOptionsText="Press Enter to add a new value"
    @create="onCreateTag"
    @deselect="onDeleteTag"
    @select="onCreateTag"
    object
  >
    <template v-slot:tag="{ option, handleTagRemove, disabled }">
      <div
        class="multiselect-tag is-user"
        :class="{
          'is-disabled': disabled,
        }"
      >
        {{ option.value }}
        <span
          v-if="!disabled"
          class="multiselect-tag-remove"
          @mousedown.prevent="handleTagRemove(option, $event)"
        >
          <span class="multiselect-tag-remove-icon"></span>
        </span>
      </div>
    </template>
  </Multiselect>

  <!-- default / text -->
  <input
    v-else
    type="text"
    class="form-control"
    :placeholder="fieldType?.controlType?.placeholder"
    v-model="thisAttribute.value"
  />
</template>

<style scoped>
label {
  min-width: 18em;
}
</style>
<style src="@vueform/multiselect/themes/default.css"></style>
