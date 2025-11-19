# Barber Shop Backend API

Sistema di gestione appuntamenti per barbieri con autenticazione JWT e lista d'attesa automatica.

## 🚀 Tecnologie

- **Java 17**
- **Spring Boot 3.5.7**
- **MySQL 8.0**
- **JWT Authentication**
- **Maven**

## 📋 Prerequisiti

- JDK 17 o superiore
- MySQL 8.0 o superiore
- Maven 3.8 o superiore

## ⚙️ Setup Locale

### 1. Database

```sql
CREATE DATABASE barber_shop;
CREATE USER 'barber_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON barber_shop.* TO 'barber_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configurazione

```bash
# Copia il file di esempio
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Modifica application.properties con i tuoi valori
# Oppure usa variabili d'ambiente (raccomandato)
```

### 3. Variabili d'Ambiente (Raccomandato)

```bash
# Windows PowerShell
$env:DB_PASSWORD="your_db_password"
$env:JWT_SECRET="your_jwt_secret_key_here"

# Linux/Mac
export DB_PASSWORD="your_db_password"
export JWT_SECRET="your_jwt_secret_key_here"
```

**Generare JWT Secret sicuro**:
```bash
# Genera una chiave di almeno 256 bit
openssl rand -base64 64
```

### 4. Build e Run

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# Oppure
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

L'applicazione sarà disponibile su: `http://localhost:8080`

## 📚 API Endpoints

### Autenticazione

- `POST /auth/register` - Registrazione nuovo utente
- `POST /auth/login` - Login (restituisce JWT token)

### Appuntamenti

- `POST /appointments` - Crea nuovo appuntamento
- `GET /appointments/user/{userId}` - Appuntamenti per utente
- `GET /appointments/barber/{barberId}` - Appuntamenti per barbiere
- `GET /appointments/{id}` - Dettagli appuntamento
- `PUT /appointments/{id}` - Aggiorna appuntamento (ADMIN)
- `DELETE /appointments/{id}` - Cancella appuntamento
- `GET /appointments/available-slots` - Slot disponibili

### Lista d'Attesa

- `POST /waiting-list` - Aggiungi alla lista d'attesa
- `GET /waiting-list/customer/{customerId}` - Lista per cliente
- `GET /waiting-list/barber/{barberId}` - Lista per barbiere
- `GET /waiting-list/{id}/position` - Posizione in coda
- `DELETE /waiting-list/{id}` - Cancella dalla lista

### Barbieri

- `GET /barbers` - Lista barbieri
- `GET /barbers/{id}` - Dettagli barbiere
- `POST /barbers` - Crea barbiere (ADMIN)
- `PUT /barbers/{id}` - Aggiorna barbiere (ADMIN)

### Servizi

- `GET /services` - Lista servizi
- `GET /services/{id}` - Dettagli servizio

## 🔐 Autenticazione

L'API usa JWT (JSON Web Tokens) per l'autenticazione.

**Header richiesto**:
```
Authorization: Bearer <your_jwt_token>
```

**Ruoli**:
- `CLIENTE` - Utente normale
- `ADMIN` - Amministratore

## 🔄 Workflow Rigetti (Cancellazione Appuntamenti)

Quando un appuntamento viene cancellato:

1. Lo stato dell'appuntamento diventa `ANNULLATO`
2. Il sistema cerca automaticamente il primo cliente in lista d'attesa
3. Se trovato, crea automaticamente un nuovo appuntamento
4. Lo stato della lista d'attesa diventa `CONFERMATO`
5. Il cliente viene notificato (se configurato)

**Stati Appuntamento**:
- `CONFERMATO` - Appuntamento attivo
- `PENDING` - In attesa di conferma
- `ANNULLATO` - Cancellato

**Stati Lista d'Attesa**:
- `IN_ATTESA` - In coda
- `NOTIFICATO` - Cliente notificato
- `CONFERMATO` - Slot assegnato
- `SCADUTO` - Tempo scaduto
- `ANNULLATO` - Richiesta cancellata

## 🧪 Testing

```bash
# Unit tests
mvn test

# Integration tests
mvn verify

# Con coverage report
mvn clean test jacoco:report
```

Report coverage: `target/site/jacoco/index.html`

## 🏗️ Architettura

```
┌─────────────────────────────────────┐
│   Controller Layer (REST API)       │
├─────────────────────────────────────┤
│   Service Layer (Business Logic)    │
├─────────────────────────────────────┤
│   Repository Layer (Data Access)    │
├─────────────────────────────────────┤
│   Database (MySQL)                  │
└─────────────────────────────────────┘
```

**Package Structure**:
```
com.example.demo/
├── config/        - Configurazioni (Security, CORS)
├── controller/    - REST Controllers
├── dto/          - Data Transfer Objects
├── exception/    - Eccezioni custom e handler
├── filter/       - JWT Request Filter
├── model/        - Entità JPA
├── repository/   - Repository interfaces
├── service/      - Business logic
└── util/         - Utilities
```

## 🔧 Configurazione Produzione

### application.properties (Produzione)

```properties
# Database
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JPA
spring.jpa.hibernate.ddl-auto=validate  # NON usare 'update' in produzione!
spring.jpa.show-sql=false

# JWT
jwt.secret=${JWT_SECRET}

# Logging
logging.level.root=WARN
logging.level.com.example.demo=INFO
```

### Variabili d'Ambiente Richieste

```bash
DB_URL=jdbc:mysql://your-production-db:3306/barber_shop
DB_USERNAME=production_user
DB_PASSWORD=secure_production_password
JWT_SECRET=your_production_jwt_secret
DDL_AUTO=validate
SHOW_SQL=false
```

## 📝 Miglioramenti Recenti

### ✅ Implementati

- **Exception Handling**: Sistema completo con eccezioni custom e global handler
- **Bean Validation**: Validazione input su tutti i DTO
- **Security**: Secrets spostati in variabili d'ambiente
- **Optimistic Locking**: Prevenzione race condition nella lista d'attesa
- **Logging**: Logger strutturato al posto di System.out/err

### 🔜 Prossimi Passi

- [ ] Swagger/OpenAPI documentation
- [ ] Test coverage > 70%
- [ ] Sistema notifiche (Email/SMS)
- [ ] DTO layer completo
- [ ] Paginazione endpoint
- [ ] CI/CD pipeline

## 🐛 Troubleshooting

### Errore: "Access denied for user"
Verifica credenziali database in `application.properties` o variabili d'ambiente.

### Errore: "JWT secret key must be at least 256 bits"
Genera un secret più lungo con `openssl rand -base64 64`.

### Errore: "Port 8080 already in use"
Cambia porta con `SERVER_PORT=8081` o termina processo sulla porta 8080.

## 📄 Licenza

Questo progetto è sviluppato per scopi educativi.

## 👥 Supporto

Per problemi o domande, contattare il team di sviluppo.
