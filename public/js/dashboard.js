const token = sessionStorage.getItem('jwt');
const tableBody = document.querySelector('#personasTableBody');
const iglesiaFilter = document.querySelector('#iglesiaFilter');
const desde = document.querySelector('#desde');
const hasta = document.querySelector('#hasta');
const mensaje = document.querySelector('#mensaje');
const userLabel = document.querySelector('#userLabel');
const exportBtn = document.querySelector('#exportBtn');
const logoutBtn = document.querySelector('#logoutBtn');
const applyFiltersBtn = document.querySelector('#applyFiltersBtn');

function parseJwt(tokenValue) {
  try {
    const payload = tokenValue.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function renderRows(rows) {
  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="7">No hay registros para los filtros seleccionados.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.nombre_completo}</td>
      <td>${row.correo}</td>
      <td>${row.codigo_postal}</td>
      <td>${row.edad}</td>
      <td>${row.iglesia_nombre}</td>
      <td>${row.evento_descripcion || '-'}</td>
      <td>${new Date(row.fecha_registro).toLocaleString('es-MX')}</td>
    </tr>
  `).join('');
}

async function fetchPersonas() {
  const params = new URLSearchParams();
  if (iglesiaFilter.value) params.set('iglesia_id', iglesiaFilter.value);
  if (desde.value) params.set('desde', desde.value);
  if (hasta.value) params.set('hasta', hasta.value);

  try {
    const response = await fetch(`/api/personas?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'No se pudieron cargar los registros.');
    }

    const rows = await response.json();
    renderRows(rows);
  } catch (error) {
    mensaje.textContent = error.message;
  }
}

async function cargarIglesias() {
  try {
    const response = await fetch('/api/iglesias');
    const iglesias = await response.json();

    iglesiaFilter.innerHTML = '<option value="">Todas</option>' + iglesias.map((iglesia) => `<option value="${iglesia.id}">${iglesia.nombre}</option>`).join('');
  } catch (error) {
    mensaje.textContent = 'No se pudieron cargar las iglesias para filtrar.';
  }
}

if (!token) {
  window.location.href = '/login.html';
} else {
  const payload = parseJwt(token);

  if (!payload) {
    sessionStorage.removeItem('jwt');
    window.location.href = '/login.html';
  }

  userLabel.textContent = `Rol: ${payload.rol} · Iglesia: ${payload.iglesia_id || 'Nacional'}`;
  cargarIglesias();
  fetchPersonas();
}

applyFiltersBtn.addEventListener('click', fetchPersonas);

exportBtn.addEventListener('click', () => {
  const params = new URLSearchParams();
  if (iglesiaFilter.value) params.set('iglesia_id', iglesiaFilter.value);
  if (desde.value) params.set('desde', desde.value);
  if (hasta.value) params.set('hasta', hasta.value);
  window.location.href = `/api/personas/export?${params.toString()}`;
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('jwt');
  window.location.href = '/login.html';
});
