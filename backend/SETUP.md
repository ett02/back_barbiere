# Setup Rapido - Backend

## ⚠️ Problema Attuale

L'applicazione non si avvia perché manca la configurazione delle variabili d'ambiente.

## ✅ Soluzione Rapida

### Opzione 1: Variabili d'Ambiente (Raccomandato)

```powershell
# Imposta le variabili d'ambiente nella sessione corrente
$env:DB_PASSWORD="password"
$env:JWT_SECRET="mySecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongForHS256Algorithm"

# Poi avvia l'applicazione
.\mvnw.cmd spring-boot:run
```

### Opzione 2: File application.properties Temporaneo

Se preferisci, puoi temporaneamente modificare `src/main/resources/application.properties`:

```properties
# Sostituisci queste righe:
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}

# Con:
spring.datasource.password=password
jwt.secret=mySecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongForHS256Algorithm
```

**⚠️ ATTENZIONE**: Non committare mai questo file con le password in chiaro!

## 🚀 Avvio Completo

```powershell
# 1. Imposta variabili d'ambiente
$env:DB_PASSWORD="password"
$env:JWT_SECRET="mySecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongForHS256Algorithm"

# 2. Avvia l'applicazione
.\mvnw.cmd spring-boot:run

# L'applicazione sarà disponibile su: http://localhost:8080
```

## ✅ Verifica Funzionamento

Una volta avviata l'applicazione, dovresti vedere:

```
Started DemoApplication in X.XXX seconds
```

## 🧪 Test Rapido

### Test Validazione (dovrebbe restituire HTTP 400)

```powershell
curl -X POST http://localhost:8080/appointments `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{\"customerId\": -1}'
```

**Risposta attesa**:
```json
{
  "status": 400,
  "error": "Validation Failed",
  "validationErrors": {
    "customerId": "Customer ID deve essere positivo",
    "barberId": "Barber ID è obbligatorio"
  }
}
```

## 📝 Miglioramenti Implementati

✅ Exception handling completo
✅ Bean Validation
✅ Secrets in environment variables
✅ Optimistic locking
✅ Logging strutturato

Consulta [walkthrough.md](file:///C:/Users/Ettore/.gemini/antigravity/brain/57b43afc-df61-4465-ba8b-2a3ffe4099d5/walkthrough.md) per i dettagli.
