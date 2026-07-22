const express = require('express');
const path = require('path');
const QRCode = require('qrcode');
const authRoutes = require('./routes/auth.routes');
const registroRoutes = require('./routes/registro.routes');
const personasRoutes = require('./routes/personas.routes');

const app = express();

function getPublicRegistrationUrl(req) {
  return process.env.PUBLIC_REGISTRATION_URL || `https://${req.get('host') || 'control-de-interes.onrender.com'}/registro.html`;
}

app.get('/config.js', (req, res) => {
  const registrationUrl = getPublicRegistrationUrl(req);

  res.type('application/javascript').send(`window.__APP_CONFIG__ = ${JSON.stringify({ registrationUrl })};`);
});

app.get('/api/qr', async (req, res) => {
  try {
    const registrationUrl = getPublicRegistrationUrl(req);
    const qrBuffer = await QRCode.toBuffer(registrationUrl, {
      type: 'png',
      width: 420,
      margin: 1,
      color: {
        dark: '#1f2d3d',
        light: '#ffffff'
      }
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.send(qrBuffer);
  } catch (error) {
    console.error('No se pudo generar el QR:', error.message);
    res.status(500).json({ message: 'No se pudo generar el código QR.' });
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/img', express.static(path.join(__dirname, '..', 'img')));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api', registroRoutes);
app.use('/api/personas', personasRoutes);

app.get('/', (req, res) => {
  res.redirect('/registro.html');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

module.exports = app;
