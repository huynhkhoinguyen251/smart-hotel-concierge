# Backend

The backend uses Node.js, Express and MySQL 8.0. Before running it, create the tables and sample data as described in [database/README.md](../database/README.md).

Run the commands below inside the `server/` folder.

## 1. Create the .env file

```powershell
Copy-Item .env.example .env
```

Open the new `.env` file and fill in these two values. Do not commit this file.

- `DB_PASSWORD`: your MySQL password.
- `JWT_SECRET`: a random string used to sign tokens. Generate one with the command below and paste the result:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Install dependencies

```powershell
npm install
```

## 3. Start the server

```powershell
npm run dev
```

This command restarts the server automatically when you edit the code. If you do not need that, use `npm start`.

## 4. Check that it works

Open <http://localhost:5000/api/health> in your browser. If the database connection works, you will see:

```json
{ "success": true, "data": { "database": "connected" }, "message": "Server is running normally" }
```

If you see `Cannot connect to the database`, read the detailed error in the terminal, then check that MySQL is running and that the `DB_` values in `.env` are correct.

## Folder structure

The backend follows the MVC pattern with a Service layer. A request flows through `routes` → `middlewares` and `validators` → `controllers` → `services` → `models` → MySQL.

| Folder in `src/` | Purpose |
|---|---|
| `routes/` | Declares API paths and the order of middleware |
| `middlewares/` | Shared steps before or after controllers: authentication, permissions, errors |
| `validators/` | Rules for checking request data |
| `controllers/` | Receives the request, calls the service and sends the response |
| `services/` | Business rules, with no SQL |
| `models/` | SQL queries and conversion of database data |
| `config/` | Configuration, including the database connection |
| `utils/` | Shared helpers: responses, errors, tokens, passwords, dates |

The `postman/` folder, outside `src/`, contains Postman collections for testing the API.
