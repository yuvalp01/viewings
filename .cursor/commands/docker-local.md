# docker-local - build image locally
# Note: Database connection variables (SQL_SERVER, SQL_USER, SQL_PASSWORD, SQL_DATABASE) should be set as environment variables at runtime
docker build -f Dockerfile-s \
  -t viewing-s:latest \ 