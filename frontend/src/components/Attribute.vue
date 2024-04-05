<script setup>
import {computed, getCurrentInstance, inject, ref} from 'vue';
import Multiselect from '@vueform/multiselect';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';
import FileFolderSelectModal from "@/components/FileFolderSelectModal.vue";
import Link from "@/components/Link.vue";
import utils from "@/utils";
import Reference from "@/components/Reference.vue";
import Organisation from "@/components/Organisation.vue";

const hasValidated = inject('hasValidated')

const props = defineProps({
  'attribute': Object,
  'fieldType': Object,
  'parent': Object,
  'row': Object,
  'isTableAttribute': Boolean
});
const emits = defineEmits(['createTag', 'deleteTag', 'deleteAttribute', 'deleteOrg', 'createOrg']);
const attributeId = 'attribute-' + getCurrentInstance().uid;
const thisAttribute = ref(props.attribute);
const curRow = ref(props.row);
const attributeControl = ref(null);
const thisMultiValuedAttribute = ref(
  props.parent?.map((a, i) => { // save the original index -- needed when deleting
      return {index: i, ...a};
    })?.filter( a  =>  a.name === thisAttribute.value.name && a?.value !== '')
)

function isString(val) {
  return typeof val === 'string' || val instanceof String;
}

const getAttributesFromFieldType = (fieldType) => {
  return (fieldType?.controlType?.values ?? []).map((val) =>
    isString(val)
      ? {name: fieldType.name, value: val}
      : {name: fieldType.name, ...val},
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
  if (merged.length === 0) return null;
  return merged;
});

const onChangeSelect = (newValue, control) => {
  // TODO: Figure out a way to bind the selected option instead of copying the individual properties
  const selected = control.options.find((o) => o.value === newValue);
  thisAttribute.value.valqual = selected?.valqual;
};

const onCreateTag = (newTag) => {
  // TODO: handle valqual
  const obj = {name: props.attribute.name, value: newTag.value ?? newTag};
  emits('createTag', obj);
  return false; // ignore the event, it will be rendered by the parent
};

const onDeleteTag = (newTag) => {
  const obj = {
    name: props.fieldType?.name,
    value: newTag?.value,
    index: newTag?.index,
  };
  emits('deleteTag', obj);
  return false; // ignore the event, it will be rendered by the parent
};

const withinThreeYears = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    date < today || date > new Date(today).setFullYear(today.getFullYear() + 3)
  );
};

const errors = computed(() => {
  const _errors = []
  //validate text fields
  if (thisAttribute?.value?.type === 'file') {
    if (props.fieldType?.display === 'required' && (!thisAttribute?.value?.path || thisAttribute?.value?.path === '')) {
      _errors.push(`File required`);
    }
  // } else if (thisAttribute?.value?.hasOwnProperty('url')) {
  //   const IDENTIFIER_REGEXP = /^([\w\s].+):([\w\W]+)$/;
  //   const URL_REGEXP = /^(http|https|ftp):\/\/.+$/;
  //   if (props.fieldType?.display === 'required' && (!thisAttribute?.value?.url || thisAttribute?.value?.url === '' || (!IDENTIFIER_REGEXP.test(thisAttribute.value?.url) && !URL_REGEXP.test(thisAttribute.value?.url)))) {
  //     _errors.push(`Link required`);
  //   }
  } else if (props.fieldType?.controlType?.name === 'orcid') {
    const isValidOrcid =  utils.isOrcidValid(thisAttribute?.value?.value)
    if ( (props.fieldType?.display === 'required' && !isValidOrcid) ||
      (props.fieldType?.display !== 'required' && thisAttribute?.value?.value && thisAttribute?.value?.value!='')
      ) {
      _errors.push(`Invalid ORCID value`);
    }
  } else if (props.fieldType?.display === 'required' && (!thisAttribute.value?.value || thisAttribute?.value?.value?.trim() === '')) {
     if(!(thisMultiValuedAttribute?.value?.length>0))
       _errors.push(`${thisAttribute?.value?.name} required`);
  }
  if (props.fieldType?.controlType?.minlength > (thisAttribute.value?.value?.trim().length ?? 0)) {
    _errors.push(`Please enter at least ${props.fieldType?.controlType?.minlength} characters. `)
  }
  if (attributeControl?.value) {
    _errors.push(attributeControl?.value?.errors)
  }
  return _errors.length ? _errors.join('. ').trim() : null;
})

defineExpose({errors, attributeId});


const showHelp = () => {
  utils.confirm(props.fieldType?.name,
    `<p>${props.fieldType?.helpContextual?.description}</p>` +
    (!props.fieldType?.helpContextual?.examples ? '' :
      `<p><h6>Examples:</h6><i>${props.fieldType?.helpContextual?.examples?.join('<p> </p>')}</i></p>`),
    "Close", true, false);
}

</script>

<template>
  <div class="input-group" :class="{'branch pt-2': !props.isTableAttribute}" :id="attributeId">
    <!--label-->
    <label class="input-group-text attribute" v-if="!props.isTableAttribute">
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
      <span class="text-muted" v-if="fieldType"><span class="attribute-name">{{ fieldType.name }}</span>
        <span class="text-danger"
              v-if="fieldType?.display==='required' || fieldType?.controlType?.minlength >0">*</span>
      </span>
      <span v-else>
      <input
        type="text"
        class="form-control attribute-name"
        v-model="thisAttribute.name"
        placeholder="Attribute name"
        :class="{'is-invalid':errors?.length}"
        style="margin-left: -1em"
      />
    </span>
      <font-awesome-icon v-if="fieldType?.helpContextual" :icon="['fas','circle-question']"
                         class="text-black-50 ps-1 small"
                         role="button" @click="showHelp()"/>
    </label>

    <!--largetext-->
    <textarea
      v-if="fieldType?.controlType?.name === 'largetext'"
      type="text"
      class="form-control"
      rows="3"
      :placeholder="fieldType?.controlType?.placeholder"
      v-model="thisAttribute.value"
      :class="{'is-invalid':errors && hasValidated}"
      :required="fieldType?.display==='required' || fieldType?.controlType?.minlength >0"
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
      :class="{'is-invalid':errors && hasValidated, 'form-control-sm':isTableAttribute}"
      :allow-empty="false"
      @change="onChangeSelect"
    >
    </Multiselect>

    <!-- organisation -- must be handled before tags -->
    <Organisation
      v-else-if="fieldType?.controlType?.name === 'org'"
      v-model="thisMultiValuedAttribute"
      :class="{'is-invalid':errors && hasValidated}"
      :fieldType="fieldType"
      @deleteOrg="(v) => emits('deleteOrg', v)"
      @createOrg="(v) => emits('createOrg', v)"
    >
    </Organisation>

    <!-- tags  -->
    <Multiselect
      v-else-if="
      (fieldType?.controlType?.name === 'select' &&
        fieldType?.controlType?.multiple) ||
      thisMultiValuedAttribute?.length > 1
    "
      v-model="thisMultiValuedAttribute"
      mode="tags"
      label="value"
      class="form-control"
      :searchable="true"
      :createOption="fieldType?.controlType?.enableValueAdd ?? true"
      :allowAbsent="fieldType?.controlType?.enableValueAdd ?? true"
      :options="singleSelectValues"
      noOptionsText="Type and press ↵ to add"
      @create="onCreateTag"
      @deselect="onDeleteTag"
      @select="onCreateTag"
      :class="{'is-invalid':errors && hasValidated , 'form-control-sm':isTableAttribute}"
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

    <!--date-->
    <datePicker
      v-else-if="fieldType?.controlType?.name === 'date'"
      class="form-control"
      v-model:value="thisAttribute.value"
      defaultValue="thisAttribute.value"
      valueType="format"
      placeholder="Select date"
      format="YYYY-MM-DD"
      :disabledDate="withinThreeYears"
      :class="{'is-invalid':errors && hasValidated}"
    />

    <!--file-->
    <FileFolderSelectModal
      v-else-if="fieldType?.controlType?.name === 'file'"
      :row="curRow"
      :file="thisAttribute"
      :class="{'is-invalid':errors && hasValidated}"
    />

    <FileFolderSelectModal
      v-else-if="fieldType?.controlType?.name === 'filelist'"
      :file="thisAttribute"
      :is-file-list=true
      :class="{'is-invalid':errors && hasValidated}"
    />

    <!-- link -->
    <Link
    v-else-if="fieldType?.controlType?.name === 'idlink'"
    ref="attributeControl"
    :row="curRow"
    :link="thisAttribute"
      :class="{'is-invalid':errors && hasValidated}"
      :placeholder="fieldType?.controlType?.placeholder"
    />

    <!-- reference  -->
    <Reference
      v-else-if="fieldType?.controlType?.name === 'reference'"
      v-model="thisAttribute.value"
      :class="{'is-invalid':errors && hasValidated}"
      :fieldType="fieldType"
    >
    </Reference>

    <!-- orcid -->
    <input
      v-else-if="fieldType?.controlType?.name === 'orcid'"
      type="text"
      class="form-control"
      :class="{'is-invalid':errors && hasValidated, 'form-control-sm':isTableAttribute}"
      :placeholder="fieldType?.controlType?.placeholder"
      v-model="thisAttribute.value"
      :required="fieldType?.display==='required' || fieldType?.controlType?.minlength >0"
    />


    <!-- default / text -->
    <input
      v-else
      type="text"
      class="form-control"
      :class="{'is-invalid':errors && hasValidated}"
      :placeholder="fieldType?.controlType?.placeholder"
      v-model="thisAttribute.value"
      :required="fieldType?.display==='required' || fieldType?.controlType?.minlength >0"
    />

    <!-- delete icon -->
    <div
      class="input-group-text btn-group-vertical"
      v-if="fieldType?.display !== 'required' &&  !props.isTableAttribute"
    >
      <font-awesome-icon
        class="icon fa-sm"
        role="button"
        icon="fa-trash"
        @click="emits('deleteAttribute', attribute)"
      ></font-awesome-icon>
    </div>
  </div>
  <div class="pb-2 ps-2 text-danger text-end small" v-if="errors?.length && hasValidated">
    {{ errors }}
    <font-awesome-icon :icon="['fas','arrow-turn-up']" transform="shrink-6 up-2"/>
  </div>
</template>

<style>
label.attribute {
  min-width: 18em;
}

:root {
  --ms-ring-color: rgba(13, 110, 253, .25);
  --ms-option-bg-selected: var(--bs-secondary);
  --ms-option-bg-selected-pointed: var(--bs-secondary);
  --ms-option-bg-pointed: var(--bs-secondary-bg);
  --ms-option-pointed: white;
}

.multiselect-tags {
  padding-left: 0 !important;
}

.multiselect-wrapper, .multiselect  {
  min-height: calc( 1.2rem + calc(var(--bs-border-width) * 2)) !important;
  min-width: 84pt !important;
}

.multiselect.form-control.form-control-sm  {
  font-size: 0.875em !important;
}

.multiselect-tag {
  background-color: transparent !important;
  border: 1px solid #aaaaaa;
  font-weight: normal !important;
  font-size: 1em !important;
  color: #333 !important;
  white-space: inherit !important;
}

.multiselect-tag-remove {
  background: #dedede !important;
}

.multiselect-multiple-label, .multiselect-placeholder, .multiselect-single-label {
  padding-left: 0 !important;
}

.small {
  font-size: 0.8em;
}
</style>
<style src="@vueform/multiselect/themes/default.css"></style>
