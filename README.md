## Enigma

Needs NodeJS `v24.8.0`.

### Project structure:

- Frontend is in `apps/frontend`. Uses React + Vite + Tailwind (shadcn).
- Backend is in `apps/backend`. ExpressJS server with firebase for authentication and cloud firestore for the database.

### Installation:

Install turborepo and pnpm `v10.0.0`.

Globally install turbo:
```
pnpm add turbo --global
```

Install the dependencies:

```
pnpm i
```

### Start development server:

```
turbo dev
```
