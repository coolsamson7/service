### STAGE 1: Build ###

FROM node:latest AS build
#RUN apk add --no-cache python3 py3-pip make g++
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm i
COPY . .
RUN npx nx run shell:build --configuration=production

### STAGE 2: Run ###

FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/apps/shell /usr/share/nginx/html
EXPOSE 80
