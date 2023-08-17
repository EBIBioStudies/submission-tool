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
export default {confirm}
