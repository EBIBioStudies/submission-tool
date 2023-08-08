import {Modal} from "bootstrap";
import {nextTick} from "vue";

const confirm = (title, message, okayLabel = 'Okay', cancelLabel = 'Cancel') => {
  const modal = document.createElement('div')
  modal.id = "modal-confirm"
  modal.className = "modal"
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
            <h5>${title}</h5>
        </div>
        <div class="modal-body fs-6">
          <p>${message}</p>
        </div>
        <div class="modal-footer border-0">
          <button id="bs-confirm-okay" type="button" class="btn btn-danger">${okayLabel}</button>
          <button id="bs-confirm-cancel" type="button" class="btn btn-primary">Cancel</button>
        </div>
    </div>
  `
  const thisModal = new Modal(modal, {
    keyboard: false,
    backdrop: 'static'
  })
  thisModal.show()

  return new Promise((resolve, reject) => {
    document.body.addEventListener('click', response)

    function response(e) {
      document.body.removeEventListener('click', response)
      document.body.querySelector('.modal-backdrop').remove()
      modal.remove()
      resolve(e.target.id === 'bs-confirm-okay')
    }
  })
}

// fill attributes and subsections of a given section according to the given template
const fillTemplate = (section, tmpl) => {
  section.type = tmpl.name
  // fill attributes
  section.attributes = [];
  [...(tmpl?.fieldTypes ?? []), ...(tmpl?.columnTypes ?? [])].forEach(
    (field) => {
      const attr = { name: field.name };
      if (field?.controlType?.defaultValue) {
        attr.value = field?.controlType?.defaultValue;
        if (field?.controlType?.values?.filter( (value) => value?.valqual!=null).length ) {
          attr.valqual = field?.controlType?.values?.find( (v)=> v.value === attr.value)?.valqual
        }
      }
      else if (field?.controlType?.name === 'select')
        attr.value = '';
      section.attributes.push(attr);
    },
  );

  // fill sections
  section.subsections = [];
  [...(tmpl?.tableTypes ?? []), ...(tmpl?.sectionTypes ?? [])].forEach(
    (sectionTemplate) => {
      const subsection = { type: sectionTemplate.name };
      section.subsections.push(subsection);
      fillTemplate(subsection, sectionTemplate);
    },
  );
}


export default {confirm, fillTemplate}
