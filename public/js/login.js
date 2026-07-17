const form = document.querySelector('#loginForm');
const mensaje = document.querySelector('#mensaje');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensaje.textContent = '';

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo iniciar sesión.');
    }

    sessionStorage.setItem('jwt', data.token);
    window.location.href = '/dashboard.html';
  } catch (error) {
    mensaje.textContent = error.message;
  }
});
