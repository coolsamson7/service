### STAGE 1: Build ###

FROM maven:3.8.3-openjdk-17 AS build
WORKDIR /usr/src/app
COPY . .
RUN mvn clean install -pl com.serious:service-administration-server -am -DskipTests -Dmaven.test.skip=true

### STAGE 2: run ###

FROM openjdk:17-jdk-slim AS run
ENV JAVA_OPTS=" -Djava.net.preferIPv4Stack=true -Dfile.encoding=UTF8 -Dserver.tomcat.uri-encoding=UTF8 --add-opens java.base/java.lang=ALL-UNNAMED "
ENV SPRING_PROFILE=default
EXPOSE 8083
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/administration/server/target/service-administration-server-0.0.3-SNAPSHOT.jar .
ENTRYPOINT exec java $JAVA_OPTS -jar service-administration-server-0.0.3-SNAPSHOT.jar