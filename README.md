1. Setup `.env`

- POSTGRES_USER
- POSTGRES_PASSWORD
- POSTGRES_DB
- POSTGRES_PORT
- DATABASE_URL
- SERVER_PORT
- JWT_SECRET_KEY
- JWT_EXPIRES
- JWT_AUDIENCE
- JWT_ISSUER

2. Run Docker Compose

`docker compose -f docker-compose.yml up --build -d`

3. Test

`curl localhost:{SERVER_PORT}`
