# 📧 Configurazione Notifiche Email - Guida per il Proprietario

Questa guida spiega come abilitare l'invio automatico delle email di conferma e notifica ai clienti del Barber Shop.

Per motivi di sicurezza, Google richiede una procedura specifica per permettere a un software (come questo gestionale) di inviare email per conto tuo. Non dovrai usare la tua password personale, ma generare una "Password per le App".

---

## ✅ Parte 1: Generare la Password (Da fare su Google)

Segui questi passaggi accedendo all'account Gmail dell'attività (es. `barbershop@gmail.com`):

1.  **Accedi alla Sicurezza**:
    *   Vai su [myaccount.google.com/security](https://myaccount.google.com/security).
    *   Assicurati di essere loggato con l'account dell'attività.

2.  **Attiva la Verifica in due passaggi** (Se non è già attiva):
    *   Scorri fino alla sezione "Come accedi a Google".
    *   Se la "Verifica in due passaggi" è su **OFF**, cliccaci e segui le istruzioni per attivarla (richiederà un numero di telefono).
    *   *Nota: Senza questo passaggio, Google non permette di generare la password necessaria.*

3.  **Genera la Password per le App**:
    *   Sempre nella sezione "Come accedi a Google", cerca la voce **"Password per le app"**.
        *   *Se non la trovi subito, usa la barra di ricerca in alto nella pagina e scrivi "Password per le app".*
    *   Clicca sulla voce. Potrebbe chiederti di fare nuovamente il login.
    *   Alla voce "Nome app", scrivi: **Gestionale Barber Shop**.
    *   Clicca su **Crea**.

4.  **Copia la Password**:
    *   Google mostrerà una password di 16 lettere (es. `abcd efgh ijkl mnop`).
    *   **Copia questa password** o annotala. Ti servirà nel prossimo passaggio.
    *   Clicca su "Fine".

---

## ⚙️ Parte 2: Inserire le Credenziali nel Sistema

Ora che hai la password speciale, devi inserirla nel programma.

### Se il programma è installato sul tuo computer:

1.  Apri la cartella del progetto.
2.  Vai nel percorso: `backend/src/main/resources/`.
3.  Crea un file di testo chiamato **`application-secrets.properties`**.
4.  Apri il file con il Blocco Note e incolla questo testo, sostituendo i tuoi dati:

```properties
# ==========================================
# CREDENZIALI EMAIL BARBER SHOP
# ==========================================

# 1. Abilita l'invio (true = attivo, false = disattivo)
app.mail.enabled=true

# 2. Inserisci qui l'indirizzo Gmail dell'attività
spring.mail.username=TUO_INDIRIZZO_EMAIL@gmail.com

# 3. Inserisci qui la Password per le App (quella di 16 lettere generata prima)
# NON usare la tua password normale di Google!
spring.mail.password=INCOLLA_QUI_LA_PASSWORD_DI_16_LETTERE
```

5.  Salva il file e chiudi.
6.  Riavvia il programma (backend) per applicare le modifiche.

---

## ❓ Risoluzione Problemi Comuni

*   **Le email non arrivano:**
    *   Controlla che `app.mail.enabled` sia impostato su `true`.
    *   Verifica di aver copiato correttamente la password di 16 lettere (senza spazi extra all'inizio o alla fine).
    *   Controlla la cartella "Spam" della casella di posta del cliente.

*   **Errore "Authentication Failed":**
    *   Hai usato la tua password normale invece di quella per le app.
    *   Hai cambiato la password del tuo account Google (questo revoca le password per le app, devi rigenerarne una nuova).
