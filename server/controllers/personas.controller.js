const pool = require('../config/db');
const PDFDocument = require('pdfkit');
const path = require('path');

const PDF_COLUMNS = [
  { label: 'Nombre completo', width: 155 },
  { label: 'Correo', width: 175 },
  { label: 'Código postal', width: 85 },
  { label: 'Edad', width: 45 },
  { label: 'Evento / descripción', width: 170 },
  { label: 'Fecha de registro', width: 90 }
];

function toPdfText(value) {
  return value == null ? '' : String(value);
}

function truncateText(value, maxLength = 40) {
  const text = toPdfText(value);
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? toPdfText(value) : date.toLocaleDateString('es-ES');
}

function drawPdfFooter(doc) {
  const pageNumber = doc.bufferedPageRange().count;
  doc.save();
  doc.fontSize(8).fillColor('#64708a').text(`Página ${pageNumber}`, 36, 570, {
    width: 720,
    align: 'right'
  });
  doc.restore();
}

function drawPdfHeader(doc) {
  const logoPath = path.join(__dirname, '..', '..', 'img', 'starchurch.png');
  doc.image(logoPath, 36, 32, { fit: [52, 52] });
  doc.fillColor('#0f2a54').fontSize(18).font('Helvetica-Bold')
    .text('Registro de personas interesadas', 104, 38);
  doc.fillColor('#64708a').fontSize(9).font('Helvetica')
    .text(`Reporte generado: ${new Date().toLocaleString('es-ES')}`, 104, 64);
}

function drawTableHeader(doc, y) {
  let x = 36;

  PDF_COLUMNS.forEach((column) => {
    doc.rect(x, y, column.width, 24).fillAndStroke('#0f2a54', '#ffffff');
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
      .text(column.label, x + 4, y + 8, { width: column.width - 8, lineBreak: false });
    x += column.width;
  });
}

function drawTableRow(doc, row, y, alternate) {
  const values = [
    toPdfText(row.nombre_completo),
    toPdfText(row.correo),
    toPdfText(row.codigo_postal),
    toPdfText(row.edad),
    truncateText(row.evento_descripcion),
    formatDate(row.fecha_registro)
  ];
  let x = 36;

  PDF_COLUMNS.forEach((column, index) => {
    doc.rect(x, y, column.width, 24).fillAndStroke(alternate ? '#eaf2ff' : '#ffffff', '#dbe4f2');
    doc.fillColor('#1c2333').fontSize(8).font('Helvetica')
      .text(values[index], x + 4, y + 8, { width: column.width - 8, lineBreak: false });
    x += column.width;
  });
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

    const generatedDate = new Date().toISOString().slice(0, 10);
    const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape', margins: { top: 36, right: 36, bottom: 42, left: 36 } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="registro-personas-${generatedDate}.pdf"`);

    doc.pipe(res);
    drawPdfHeader(doc);

    let y = 112;
    drawTableHeader(doc, y);
    y += 24;

    rows.forEach((row, index) => {
      if (y + 24 > 555) {
        drawPdfFooter(doc);
        doc.addPage();
        drawPdfHeader(doc);
        y = 112;
        drawTableHeader(doc, y);
        y += 24;
      }

      drawTableRow(doc, row, y, index % 2 === 1);
      y += 24;
    });

    drawPdfFooter(doc);
    return doc.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo exportar el PDF.' });
  }
}

module.exports = {
  getPersonas,
  exportPersonas
};
