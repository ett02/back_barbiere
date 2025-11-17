# Progetto Barberia 

Benvenuto nel frontend del progetto Barberia! Questa applicazione è stata sviluppata con [Angular CLI](https://github.com/angular/angular-cli) e si interfaccia con un backend dedicato per fornire una soluzione completa per la gestione di un salone da barbiere.

Questo README ti guiderà attraverso l'installazione, la configurazione e l'avvio dell'intero stack applicativo (frontend e backend).

## Prerequisiti

Prima di iniziare, assicurati di avere installato sul tuo computer:

- **Java Development Kit (JDK)**: Versione 17 o superiore.
- **Node.js**: Versione 18.x o superiore.
- **npm**: Generalmente incluso con Node.js.
- **MySQL**: Il server del database.
- **DBeaver** (o un altro client SQL): Per gestire il database.

## Installazione e Configurazione

Segui questi passaggi per configurare l'ambiente di sviluppo locale.

### 1. Configurazione del Database (MySQL)

Il backend richiede un database MySQL per funzionare.

1.  Apri **DBeaver** e connettiti al tuo server MySQL.
2.  Crea un nuovo database per il progetto eseguendo questo comando SQL:

    ```sql
    CREATE DATABASE nome_del_database;
    ```

    > **Nota**: Ricorda il `nome_del_database` che hai scelto, ti servirà per configurare il backend.

#### Script di popolamento iniziale

Per avere subito dati di test (un admin, un cliente, servizi, barbieri, orari del negozio e disponibilità settimanale) puoi
eseguire lo script `backend/database/seed_sample_data.sql` direttamente da DBeaver dopo aver selezionato il database appena
creato. Lo script:

- svuota le tabelle principali rispettando le chiavi esterne;
- inserisce due utenti con password predefinita `password` (hash BCrypt già presente nello script);
- popola i cataloghi di servizi, barbieri, disponibilità e orari.

> Ricordati di cambiare le password o creare utenti reali prima di andare in produzione.

### 2. Configurazione del Backend

Il backend è un'applicazione Spring Boot. La configurazione avviene tramite il file `application.properties`.

1.  Naviga nella cartella del backend dal tuo terminale.
2.  Le dipendenze verranno scaricate automaticamente da Maven al primo avvio.
3.  Apri il file `src/main/resources/application.properties` e configuralo con i dati del tuo database:

    ```properties
    # Configurazione del server
    server.port=8080
    
    # Configurazione del DataSource MySQL
    spring.datasource.url=jdbc:mysql://localhost:3306/nome_del_database
    spring.datasource.username=root
    spring.datasource.password=la_tua_password_mysql
    spring.jpa.hibernate.ddl-auto=update
    ```

### 3. Configurazione del Frontend (Angular)

1.  Naviga nella cartella del frontend (`frontend/`) in un **nuovo terminale**.
2.  Installa le dipendenze:
    ```bash
    npm install
    ```

## Avvio dell'Applicazione

Per lavorare sull'applicazione, devi avviare sia il server backend che quello frontend in due terminali separati.

### Avvio Backend

Nel terminale posizionato sulla cartella del **backend**, esegui:

```bash
# Su Windows
.\mvnw.cmd spring-boot:run

# Su Linux/macOS
./mvnw spring-boot:run
```
Il server sarà in ascolto su `http://localhost:8080` (o la porta specificata nel file `application.properties`).

### Avvio Frontend

Nel terminale posizionato sulla cartella del **frontend**, esegui il comando per avviare il server di sviluppo di Angular:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
