# docker-local - build image locally
docker build -f Dockerfile-s \
  --build-arg DATABASE_URL=$DATABASE_URL  -t viewing-s:latest \ 