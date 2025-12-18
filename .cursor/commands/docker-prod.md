# docker-prod - buld and push image
yuval@Mac cursor-test5 % docker buildx build --platform linux/amd64 -f Dockerfile-s \
  -t yns360.azurecr.io/viewings:prod \
  -t yns360.azurecr.io/viewings:latest \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --push .