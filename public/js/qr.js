const qrCodeCanvas = document.querySelector('#qrCode');
const shareUrl = window.__APP_CONFIG__?.registrationUrl || `${window.location.origin}/registro.html`;

if (window.QRCode) {
  QRCode.toCanvas(qrCodeCanvas, shareUrl, { width: 420, margin: 1 }, (error) => {
    if (error) {
      console.error(error);
    }
  });
} else {
  console.error('QRCode no está disponible.');
}
