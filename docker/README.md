# Docker

## Start

`docker compose -f web-compose.yml up -d`

will start
- consul
- keycloak
- administration server ( including the ui )
- two microservices including the generic shell

# Administration Server

Navigate to

http://localhost:8083/home

# Consul

**Navigate to

http://localhost:8500/ui/dc1/services

# Keycloak

Navigate to

http://localhost:8080/admin/master/console/**




# Microservices

**Navigate to

http://localhost:4203/

the shell, which hosts two other microfrontends

* http://localhost:4201/
* http://localhost:4202/

The microfrontends can be opened individually of course, but they lack any kind of navigation possibilities.