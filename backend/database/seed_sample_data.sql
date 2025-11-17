-- Seed script for the barbershop backend (MySQL 8+).
--
-- It clears the main domain tables and inserts:
--   * one ADMIN user and one CLIENTE user
--   * a catalog of services
--   * two sample barbers and their services
--   * weekly availability slots for each barber
--   * the global shop opening hours
--
-- The BCrypt hash used below corresponds to the plain text password "password"
-- so you can log in with that credential after seeding (change it in production).

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE waiting_list;
TRUNCATE TABLE appointments;
TRUNCATE TABLE availability;
TRUNCATE TABLE barber_services;
TRUNCATE TABLE barbers;
TRUNCATE TABLE services;
TRUNCATE TABLE shop_hours;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

START TRANSACTION;

INSERT INTO users (nome, cognome, email, password, ruolo, data_creazione) VALUES
  ('Admin', 'Barbiere', 'admin@barbershop.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5Y8DT8uMerOAZZU1iG8BtW/6p16ea', 'ADMIN', NOW()),
  ('Marco', 'Rossi', 'marco.rossi@example.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5Y8DT8uMerOAZZU1iG8BtW/6p16ea', 'CLIENTE', NOW());

INSERT INTO services (nome, durata, prezzo, descrizione) VALUES
  ('Taglio classico', 30, 18.00, 'Taglio tradizionale con rifinitura forbice + macchinetta'),
  ('Taglio + Barba', 45, 28.00, 'Servizio completo con styling barba e capelli'),
  ('Rifinitura barba', 20, 15.00, 'Definizione veloce con panni caldi e oli nutrienti'),
  ('Trattamento deluxe', 50, 32.00, 'Impacco ristrutturante con massaggio cuoio capelluto');

INSERT INTO barbers (nome, cognome, esperienza, `specialità`, is_active, user_id) VALUES
  ('Luca', 'Bianchi', '8 anni di esperienza in tagli classici e barbe impeccabili', 'Rifiniture classiche', 1, NULL),
  ('Simone', 'Verdi', '5 anni focalizzati su look moderni e sfumature', 'Fade moderni', 1, NULL);

-- Associazioni barber <-> services
INSERT INTO barber_services (barbiere_id, servizio_id)
SELECT b.id, s.id
FROM barbers b
JOIN services s ON s.nome IN ('Taglio classico', 'Taglio + Barba', 'Rifinitura barba')
WHERE b.nome = 'Luca' AND b.cognome = 'Bianchi';

INSERT INTO barber_services (barbiere_id, servizio_id)
SELECT b.id, s.id
FROM barbers b
JOIN services s ON s.nome IN ('Taglio + Barba', 'Rifinitura barba', 'Trattamento deluxe')
WHERE b.nome = 'Simone' AND b.cognome = 'Verdi';

-- Disponibilità settimanale dei barbieri (Lun=1 ... Sab=6)
WITH RECURSIVE giorni AS (
    SELECT 1 AS giorno
    UNION ALL
    SELECT giorno + 1 FROM giorni WHERE giorno < 6
)
INSERT INTO availability (barbiere_id, giorno, orario_inizio, orario_fine)
SELECT b.id, g.giorno, '09:00:00', '18:00:00'
FROM giorni g
CROSS JOIN barbers b;

-- Orari di apertura del negozio (0=Domenica ... 6=Sabato)
INSERT INTO shop_hours (giorno, is_chiuso, orario_apertura, orario_chiusura) VALUES
  (0, 1, NULL, NULL),
  (1, 0, '09:00:00', '19:00:00'),
  (2, 0, '09:00:00', '19:00:00'),
  (3, 0, '09:00:00', '19:00:00'),
  (4, 0, '09:00:00', '19:00:00'),
  (5, 0, '09:00:00', '18:00:00'),
  (6, 0, '09:00:00', '17:00:00');

COMMIT;
