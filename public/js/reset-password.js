const form = document.querySelector('#resetForm');
const mensaje = document.querySelector('#mensaje');
const tokenInput = document.querySelector('#tokenInput');

const params = new URLSearchParams(window.location.search);
const token = params.get('token') || '';

tokenInput.value = token;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensaje.textContent = '';

  const payload = Object.fromEntries(new FormData(form).entries());

  if (payload.nuevaPassword !== payload.confirmPassword) {
    mensaje.textContent = 'Las contraseñas no coinciden.';
    mensaje.style.color = 'var(--ember)';
    return;
  }

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo restablecer la contraseña.');
    }

    mensaje.textContent = data.message;
    mensaje.style.color = 'var(--success)';
    form.reset();
    window.location.href = '/login.html';
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.style.color = 'var(--ember)';
  }
});
