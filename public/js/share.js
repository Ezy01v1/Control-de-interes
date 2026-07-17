const shareLink = document.querySelector('#shareLink');
const copyLinkBtn = document.querySelector('#copyLinkBtn');
const mensaje = document.querySelector('#mensaje');

const shareUrl = window.__APP_CONFIG__?.registrationUrl || `${window.location.origin}/registro.html`;
shareLink.textContent = shareUrl;

copyLinkBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    mensaje.textContent = 'Link copiado.';
  } catch (error) {
    mensaje.textContent = 'No se pudo copiar el link automáticamente.';
  }
});
