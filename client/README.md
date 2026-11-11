# Frontend

The frontend uses React, Vite, Tailwind CSS, Axios and React Router. It talks to the backend in [server/](../server/README.md).

Run the commands below inside the `client/` folder.

## 1. Start the backend first

The backend must be running, and its `.env` must allow this frontend through CORS:

```
CLIENT_URL=http://localhost:5173
```

See [server/README.md](../server/README.md) for how to start it.

## 2. Create the .env file

```powershell
Copy-Item .env.example .env
```

| Variable | Meaning | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API, including `/api` | `http://localhost:5000/api` |

If you do not create `.env`, the default value is used. Restart `npm run dev` after changing `.env`. Do not commit this file.

## 3. Install dependencies

```powershell
npm install
```

## 4. Start the development server

```powershell
npm run dev
```

Open <http://localhost:5173>. The port is fixed to 5173 so that it matches `CLIENT_URL` in the backend.

## 5. Build for production

```powershell
npm run build
npm run preview
```

`npm run build` creates the `dist/` folder. `npm run preview` serves it locally for a final check.

## Test accounts

Use the test accounts listed in [database/README.md](../database/README.md), or register a new account.

## Folder structure

| Folder in `src/` | Purpose |
|---|---|
| `api/` | One Axios instance (`client.js`) and one file per backend module. Pages never call Axios directly. |
| `config/` | Environment variables (`env.js`) and navigation links |
| `context/` | Login state (`AuthContext.jsx`) |
| `hooks/` | Shared hooks, such as `useAuth` |
| `routes/` | Page routes, plus `ProtectedRoute` (logged-in users) and `AdminRoute` (admins only) |
| `layouts/` | Page frames: `MainLayout` for guests and `AdminLayout` for admins |
| `components/` | Reusable pieces: `ui/` (buttons, inputs, alerts) and `layout/` (header, footer) |
| `pages/` | One component per page |
| `utils/` | Helpers: currency and date formatting, image URLs, token storage |
