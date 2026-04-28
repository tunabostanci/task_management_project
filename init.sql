volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./init.sql/:docker-entrypoint-initdb.d/init.sql
