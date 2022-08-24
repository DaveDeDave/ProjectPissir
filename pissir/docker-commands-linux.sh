case "$1" in
  docker:start:prod)
    docker-compose up -d --build
  ;;
  docker:stop:prod)
    docker-compose down
  ;;
  docker:start:dev)
    docker-compose -f docker-compose.dev.yml up -d --build
  ;;
  docker:stop:dev)
    docker-compose -f docker-compose.dev.yml down
  ;;
  docker:cleanup)
    docker-compose down && docker volume rm pissir_auth-data pissir_mosquitto-data pissir_mosquitto-log pissir_mysql
  ;;
esac