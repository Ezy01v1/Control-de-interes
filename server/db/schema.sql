CREATE TABLE IF NOT EXISTS iglesias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  activa BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('pastor', 'junta') NOT NULL,
  iglesia_id INT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (iglesia_id) REFERENCES iglesias(id)
);

CREATE TABLE IF NOT EXISTS personas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(200) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  codigo_postal VARCHAR(20) NOT NULL,
  edad INT NOT NULL,
  iglesia_id INT NOT NULL,
  evento_descripcion VARCHAR(255) NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (iglesia_id) REFERENCES iglesias(id)
);

CREATE INDEX idx_personas_iglesia ON personas(iglesia_id);
