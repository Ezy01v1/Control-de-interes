-- Seed inicial para las 13 iglesias placeholder.
-- Cambia los nombres reales después en tu entorno de producción.
INSERT IGNORE INTO iglesias (id, nombre, activa) VALUES
(1, 'Iglesia 1', TRUE),
(2, 'Iglesia 2', TRUE),
(3, 'Iglesia 3', TRUE),
(4, 'Iglesia 4', TRUE),
(5, 'Iglesia 5', TRUE),
(6, 'Iglesia 6', TRUE),
(7, 'Iglesia 7', TRUE),
(8, 'Iglesia 8', TRUE),
(9, 'Iglesia 9', TRUE),
(10, 'Iglesia 10', TRUE),
(11, 'Iglesia 11', TRUE),
(12, 'Iglesia 12', TRUE),
(13, 'Iglesia 13', TRUE);

-- Usuario de ejemplo para el panel consolidado.
-- Genera el hash con:
-- node -e "const bcrypt=require('bcryptjs'); const password='Admin123!'; bcrypt.hash(password, 10).then(hash => console.log(hash));"
INSERT IGNORE INTO usuarios (id, nombre, email, password_hash)
VALUES (
  1,
  'Junta Demo',
  'junta@iglesia.local',
  '$2b$10$Qn2vXb1X1jY1wP7u6G7gouKJqXEs4lD7p9L6OzQ5WzvO2Gq6F6Ae.'
);


SELECT * FROM iglesias LIMIT 1;