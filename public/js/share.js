const shareLink = document.querySelector('#shareLink');
const copyLinkBtn = document.querySelector('#copyLinkBtn');
const qrCodeCanvas = document.querySelector('#qrCode');
const mensaje = document.querySelector('#mensaje');

const shareUrl = `${window.location.origin}/registro.html`;
shareLink.textContent = shareUrl;

if (window.QRCode) {
  QRCode.toCanvas(qrCodeCanvas, shareUrl, { width: 220, margin: 1 }, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

copyLinkBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    mensaje.textContent = 'Link copiado.';
  } catch (error) {
    mensaje.textContent = 'No se pudo copiar el link automáticamente.';
  }
});
