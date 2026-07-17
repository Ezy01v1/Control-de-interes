const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const registroRoutes = require('./routes/registro.routes');
const personasRoutes = require('./routes/personas.routes');

const app = express();

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
