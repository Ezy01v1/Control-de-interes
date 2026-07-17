const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const registroRoutes = require('./routes/registro.routes');
const personasRoutes = require('./routes/personas.routes');

const app = express();

app.get('/config.js', (req, res) => {
  const registrationUrl = process.env.PUBLIC_REGISTRATION_URL || `https://${req.get('host') || 'control-de-interes.onrender.com'}/registro.html`;

  res.type('application/javascript').send(`window.__APP_CONFIG__ = ${JSON.stringify({ registrationUrl })};`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
