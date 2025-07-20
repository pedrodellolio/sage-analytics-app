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

### Run commands inside Docker

`docker compose run [SERVICE_NAME] [COMMAND]` like `docker compose run server npx prisma migrate dev`

### Enter container shell

`docker compose run --rm [SERVICE_NAME] sh`
`exit`

### Test

`curl localhost:{SERVER_PORT}`
