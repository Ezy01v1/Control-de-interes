const form = document.querySelector('#registroForm');
const iglesiaSelect = document.querySelector('#iglesiaSelect');
const mensaje = document.querySelector('#mensaje');
const shareLink = document.querySelector('#shareLink');
const copyLinkBtn = document.querySelector('#copyLinkBtn');
const qrCodeCanvas = document.querySelector('#qrCode');

const shareUrl = `${window.location.origin}${window.location.pathname}`;

shareLink.textContent = shareUrl;

if (window.QRCode) {
  QRCode.toCanvas(qrCodeCanvas, shareUrl, { width: 180, margin: 1 }, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

copyLinkBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    mensaje.textContent = 'Link copiado al portapapeles.';
  } catch (error) {
    mensaje.textContent = 'No se pudo copiar el link automáticamente.';
  }
});

async function cargarIglesias() {
  try {
    const response = await fetch('/api/iglesias');
    const iglesias = await response.json();

    iglesiaSelect.innerHTML = '<option value="">Selecciona una iglesia</option>' +
      iglesias.map((iglesia) => `<option value="${iglesia.id}">${iglesia.nombre}</option>`).join('');
  } catch (error) {
    mensaje.textContent = 'No se pudieron cargar las iglesias en este momento.';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensaje.textContent = '';

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.edad = Number(payload.edad);
  payload.iglesia_id = Number(payload.iglesia_id);

  try {
    const response = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo registrar la información.');
    }

    mensaje.textContent = data.message;
    form.reset();
  } catch (error) {
    mensaje.textContent = error.message;
  }
});

cargarIglesias();
