const pool = require('../config/db');

function escapeCsv(value) {
  const stringValue = value == null ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function buildPersonasQuery(filters) {
  const conditions = [];
  const values = [];

  if (filters.desde) {
    conditions.push('DATE(p.fecha_registro) >= DATE(?)');
    values.push(filters.desde);
  }

  if (filters.hasta) {
    conditions.push('DATE(p.fecha_registro) <= DATE(?)');
    values.push(filters.hasta);
  }

  let query = `
    SELECT p.id, p.nombre_completo, p.correo, p.codigo_postal, p.edad, p.evento_descripcion, p.fecha_registro
    FROM personas p
  `;

  if (conditions.length) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY p.fecha_registro DESC';

  return { query, values };
}

async function getPersonas(req, res) {
  const { desde, hasta } = req.query;

  try {
    const { query, values } = buildPersonasQuery({ desde, hasta });
    const [rows] = await pool.execute(query, values);

    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudieron cargar los registros.' });
  }
}

async function exportPersonas(req, res) {
  const { desde, hasta } = req.query;

  try {
    const { query, values } = buildPersonasQuery({ desde, hasta });
    const [rows] = await pool.execute(query, values);

    const header = [
      'id',
      'nombre_completo',
      'correo',
      'codigo_postal',
      'edad',
      'evento_descripcion',
      'fecha_registro'
    ];

    const csvRows = [header.join(',')];

    rows.forEach((row) => {
      csvRows.push([
        row.id,
        row.nombre_completo,
        row.correo,
        row.codigo_postal,
        row.edad,
        row.evento_descripcion,
        row.fecha_registro
      ].map(escapeCsv).join(','));
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="personas.csv"');

    return res.status(200).send(csvRows.join('\n'));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo exportar el CSV.' });
  }
}

module.exports = {
  getPersonas,
  exportPersonas
};
