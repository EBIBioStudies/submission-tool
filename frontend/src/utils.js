import {Modal} from "bootstrap";

const confirm = (title, message, okayLabel = 'Close', isLarge = false, showCancel = true, cancelLabel = 'Cancel') => {
  const modal = document.createElement('div')
  let isOkay = false
  modal.id = "modal-confirm"
  modal.className = "modal" + (isLarge ? ' modal-lg' : '')
  modal.tabIndex = -1
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable ">
      <div class="modal-content">
        <div class="modal-header">
            <h5>${title}</h5>
        </div>
        <div class="modal-body fs-6">
          <p>${message}</p>
        </div>
        <div class="modal-footer border-0">
          <button id="bs-confirm-okay" type="button" class="btn ${showCancel? 'btn-danger' : 'btn-primary'}">${okayLabel}</button>
         ${showCancel ? `<button data-bs-dismiss="modal"  type="button" class="btn btn-primary">${cancelLabel}</button>` : ''}
        </div>
    </div>
  `
  const thisModal = new Modal(modal)
  thisModal.show()
  document.querySelector('#bs-confirm-okay').addEventListener('click', (e) => {
    isOkay = true;
    thisModal.hide();
  });
  return new Promise((resolve, reject) => {
    modal.addEventListener('hide.bs.modal', (e) => {
      document.body.querySelector('.modal-backdrop').remove()
      modal.remove()
      resolve(isOkay)
    })
  })
}

// fill attributes and subsections of a given section according to the given template
const fillTemplate = (section, tmpl) => {
  section.type = tmpl.name
  // fill attributes
  section.attributes = [];
  [...(tmpl?.fieldTypes ?? []), ...(tmpl?.columnTypes ?? [])].forEach(
    (field) => {
      const attr = {name: field.name};
      if (field?.controlType?.defaultValue) {
        attr.value = field?.controlType?.defaultValue;
        if (field?.controlType?.values?.filter((value) => value?.valqual != null).length) {
          attr.valqual = field?.controlType?.values?.find((v) => v.value === attr.value)?.valqual
        }
      } else if (field?.controlType?.name === 'select')
        attr.value = '';
      section.attributes.push(attr);
    },
  );

  // fill sections
  [...(tmpl?.tableTypes ?? []), ...(tmpl?.sectionTypes ?? [])].forEach(
    (sectionTemplate) => {
      const subsection = {type: sectionTemplate.name};
      if (subsection.type?.toLowerCase()==='file') {
        if (!section.files) section.files = [];
        section.files.push(subsection);
      } else {
        if (!section.subsections) section.subsections = [];
        section.subsections.push(subsection);
      }
      fillTemplate(subsection, sectionTemplate);
    },
  );
}


export default {confirm, fillTemplate}
