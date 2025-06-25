# Sage Analytics

### Setup `.env.prod` and `.env.local`:

```
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_PORT=
DATABASE_URL=
SERVER_PORT=
JWT_SECRET_KEY=
JWT_EXPIRES=
JWT_AUDIENCE=
JWT_ISSUER=
```

### Run Container

`npm run build`
`docker compose -f docker-compose.yml up --build -d`

### Test

`curl localhost:{SERVER_PORT}`
