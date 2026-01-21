import { Modal } from 'bootstrap';

const confirm = (title, message, {okayLabel = 'Close', isLarge = false, showCancel = true, cancelLabel = 'Cancel', level = 'danger'} = {}) => {
  const modal = document.createElement('div');
  let isOkay = false;
  modal.id = 'modal-confirm';
  modal.className = 'modal' + (isLarge ? ' modal-lg' : '');
  modal.tabIndex = -1;
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
         ${showCancel ? `<button id="bs-confirm-cancel" type="button" class="btn btn-outline-${level}" data-bs-dismiss="modal">${cancelLabel}</button>` : ''}
          <button id="bs-confirm-okay" type="button" class="btn btn-${level}" >${okayLabel}</button>
        </div>
    </div>
  `;
  const thisModal = new Modal(modal);
  thisModal.show();

  const accept = () => {
    isOkay = true;
    thisModal.hide();
  };
  document.querySelector('#bs-confirm-okay').addEventListener('click', () => accept());
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.id !== 'bs-confirm-cancel') {
      accept();
    }
  });

  return new Promise((resolve, reject) => {
    modal.addEventListener('hide.bs.modal', (e) => {
      document.body.querySelector('.modal-backdrop').remove();
      modal.remove();
      resolve(isOkay);
    });
  });
};

const prompt = (title, message, {okayLabel = 'Close', isLarge = false, showCancel = true, cancelLabel = 'Cancel'} = {}) => {
  const modal = document.createElement('div');
  modal.id = 'modal-confirm';
  modal.className = 'modal' + (isLarge ? ' modal-lg' : '');
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-scrollable ">
     <form @submit.prevent="closePrompt">
       <div class="modal-content">
          <div class="modal-header">
            <h5>${title}</h5>
          </div>
          <div class="modal-body fs-6">
            ${message}
            <input class="form-control" id="prompt" required />
          </div>
          <div class="modal-footer border-0">
             ${showCancel ? `<button data-bs-dismiss="modal"  type="button" class="btn btn-secondary">${cancelLabel}</button>` : ''}
             <button type="submit" id="bs-confirm-okay" type="button" class="btn btn-primary">${okayLabel}</button>
          </div>
       </div>
     </form>
    </div>
  `;
  const thisModal = new Modal(modal);
  thisModal.show();
  document.body.querySelector('#prompt').focus();
  document.querySelector('#bs-confirm-okay').addEventListener('click', (e) => {
    thisModal.hide();
  });
  const closePrompt = () => {
    thisModal.hide();
  };
  return new Promise((resolve, reject) => {
    modal.addEventListener('hide.bs.modal', (e) => {
      const value = document.body.querySelector('#prompt').value;
      document.body.querySelector('.modal-backdrop').remove();
      modal.remove();
      resolve(value);
    });
  });
};

const isOrcidValid = (orcid) => {
  if (!orcid)
    return false;
  const orcidFormatRegex = /\d{4}-\d{4}-\d{4}-\d{3}[\dX]/gi;
  const matches = orcid?.match(orcidFormatRegex);
  if (matches === null) return false;
  const digits = orcid.replace(/-/g, '');
  const baseDigits = digits.slice(0, 15).split('');
  const checkDigit = digits.charAt(15);
  const total = baseDigits.reduce((parcialTotal, digit) => (parcialTotal + parseInt(digit, 10)) * 2, 0);
  const remainder = total % 11;
  const result = (12 - remainder) % 11;
  const expectedCheckDigit = result === 10 ? 'X' : result.toString();
  return checkDigit === expectedCheckDigit;
};

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
const humanFileSize = (bytes, si = true, dp = 2) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) return bytes + ' B';

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
};

export default { confirm, prompt, isOrcidValid, humanFileSize };
