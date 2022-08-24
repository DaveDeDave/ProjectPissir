@echo off

IF "%1"=="docker:start:prod" (
  docker-compose up -d --build
)
IF "%1"=="docker:stop:prod" (
  docker-compose down
)
IF "%1"=="docker:start:dev" ( 
  docker-compose -f docker-compose.dev.yml up -d --build
)
IF "%1"=="docker:stop:dev" ( 
  docker-compose -f docker-compose.dev.yml down
)
IF "%1"=="docker:cleanup" ( 
  docker-compose down && docker volume rm pissir_auth-data pissir_mosquitto-data pissir_mosquitto-log pissir_mysql
)