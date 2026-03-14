const backdrop = document.getElementById('modal-backdrop');
const header   = document.getElementById('modal-header');
const body     = document.getElementById('modal-body');

export function openModal(title, contentHTML) {
  header.innerHTML = `<h3>${title}</h3><button class="modal-close" id="modal-close-btn">&times;</button>`;
  body.innerHTML = contentHTML;
  backdrop.classList.remove('hidden');
  document.getElementById('modal-close-btn').onclick = closeModal;
  backdrop.onclick = (e) => { if (e.target === backdrop) closeModal(); };
}

export function closeModal() {
  backdrop.classList.add('hidden');
  header.innerHTML = '';
  body.innerHTML = '';
}
