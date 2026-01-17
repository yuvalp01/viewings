# docker-prod - build and push image
# Note: Database connection variables (SQL_SERVER, SQL_USER, SQL_PASSWORD, SQL_DATABASE) should be set as environment variables at runtime
docker buildx build --platform linux/amd64 -f Dockerfile-s \
  -t yns360.azurecr.io/viewings:prod \
  -t yns360.azurecr.io/viewings:latest \
  --push .