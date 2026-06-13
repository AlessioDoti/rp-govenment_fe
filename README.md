# rp-government-system-fe

Frontend for the RP Government System — Vue 3 + Vite + Bootstrap 5 + Pinia + Vue Router.

Single-page application with atomic design architecture (atoms, molecules, organisms, templates, views). Dark theme, responsive layout.

## Dependencies

- **rp-auth-system** (`http://localhost:8083`) — login, registration, user info
- **rp-person-system** (`http://localhost:8082`) — person CRUD and search
- **rp-burocracy-system** (`http://localhost:8081`) — categories, activities, tax declarations

API base URLs are configured in `src/services/httpClient.js`.

## Run without Docker

Prerequisito: tutti e tre i backend in esecuzione (auth :8083, person :8082, burocracy :8081).

### Sviluppo (Vite dev server)

```sh
npm install
npm run dev
```

Aprire `http://localhost:5173` nel browser. Il dev server di Vite ricarica automaticamente le modifiche.

### Produzione (build statici)

```sh
npm run build
```

I file generati in `dist/` possono essere serviti con qualsiasi server statico:

```sh
npm run preview    # server di preview Vite
# oppure
npx serve dist     # servito su http://localhost:3000
```

## Run with Docker

### Singolo container

```sh
docker build -t rp-frontend .
docker run -d -p 80:80 rp-frontend
```

Served via nginx su `http://localhost:80`. I backend devono essere raggiungibili su `localhost:8081/8082/8083`.

### Ecosistema completo

```sh
# Dalla root del progetto (rp-government-system/)
docker compose up -d
```

## Build for production

```sh
npm run build
```

Output goes to `dist/`. Serve with any static server or nginx.

## Project structure

```
src/
├── assets/          # static assets
├── components/
│   ├── atoms/       # basic UI primitives (buttons, inputs, icons)
│   ├── molecules/   # composed primitives (search bars, cards, pagination)
│   └── organisms/   # complex UI blocks (forms, modals, tables)
├── composables/     # Vue composables (useAuth, useResourceList, etc.)
├── layouts/         # layout components (AuthLayout, PublicLayout)
├── router/          # Vue Router config
├── services/        # HTTP client adapters (api.js, httpClient.js)
├── stores/          # Pinia stores (auth, persons, activities)
├── views/           # page-level components (LoginView, DashboardView, etc.)
└── App.vue          # root component
```
