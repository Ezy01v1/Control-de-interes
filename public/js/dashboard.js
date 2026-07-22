const token = sessionStorage.getItem('jwt');
const tableBody = document.querySelector('#personasTableBody');
const desde = document.querySelector('#desde');
const hasta = document.querySelector('#hasta');
const mensaje = document.querySelector('#mensaje');
const userLabel = document.querySelector('#userLabel');
const exportBtn = document.querySelector('#exportBtn');
const logoutBtn = document.querySelector('#logoutBtn');
const applyFiltersBtn = document.querySelector('#applyFiltersBtn');
const shareLink = document.querySelector('#shareLink');
const copyLinkBtn = document.querySelector('#copyLinkBtn');

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
    tableBody.innerHTML = '<tr><td colspan="6">No hay registros para los filtros seleccionados.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.nombre_completo}</td>
      <td>${row.correo}</td>
      <td>${row.codigo_postal}</td>
      <td>${row.edad}</td>
      <td>${row.evento_descripcion || '-'}</td>
      <td>${new Date(row.fecha_registro).toLocaleString('es-MX')}</td>
    </tr>
  `).join('');
}

async function fetchPersonas() {
  const params = new URLSearchParams();
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

if (!token) {
  window.location.href = '/login.html';
} else {
  const payload = parseJwt(token);

  if (!payload) {
    sessionStorage.removeItem('jwt');
    window.location.href = '/login.html';
  }

  userLabel.textContent = payload.nombre || payload.email || 'Usuario';
  fetchPersonas();
}

applyFiltersBtn.addEventListener('click', fetchPersonas);

exportBtn.addEventListener('click', async () => {
  const params = new URLSearchParams();
  if (desde.value) params.set('desde', desde.value);
  if (hasta.value) params.set('hasta', hasta.value);

  try {
    const response = await fetch(`/api/personas/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'No se pudo exportar el PDF.');
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    const generatedDate = new Date().toISOString().slice(0, 10);

    downloadLink.href = downloadUrl;
    downloadLink.download = `registro-personas-${generatedDate}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    mensaje.textContent = error.message;
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('jwt');
  window.location.href = '/login.html';
});
