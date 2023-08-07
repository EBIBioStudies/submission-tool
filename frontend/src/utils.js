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

// parent level functions need to be replicated here for now
export const addTable = async (section, componentInstance) => {
  section.subsections = section.subsections || [];
  section.subsections.push([{
    accno: (section.accno ?? Date.now()) + '-' + (section.subsections.length + 1),
    type: '',
    attributes: [{name: 'Column 1', value: ''}],
    subsections: [],
  }]);

  // wait till the UI is updated and the focus the first attribute name
  await nextTick();
  const added = [...componentInstance.refs.sectionsComponent].pop().$.ctx.$el;
  added.scrollIntoView();
  /*await nextTick();

  // New section added to first is always collapsed
  if (added.classList.contains('collapsed'))
    added.querySelector('.section-title').click();*/
}


export default {confirm, addTable}
