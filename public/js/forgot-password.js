const form = document.querySelector('#forgotForm');
const mensaje = document.querySelector('#mensaje');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensaje.textContent = '';

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch('/api/auth/solicitar-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo enviar el enlace.');
    }

    mensaje.textContent = data.message;
    mensaje.style.color = 'var(--success)';
    form.reset();
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.style.color = 'var(--ember)';
  }
});
