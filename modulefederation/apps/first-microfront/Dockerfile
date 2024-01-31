### STAGE 1: Build ###

FROM node:latest AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./docker/startup.sh ./
RUN npm i
COPY . .
RUN npx nx run first-microfront:build --configuration=production

### STAGE 2: Run ###

FROM nginx:latest
WORKDIR /usr/src/app
#RUN apk --no-cache add curl
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/apps/first-microfront /usr/share/nginx/html
COPY --from=build /usr/src/app/startup.sh .
CMD ["sh", "-c", "/usr/src/app/startup.sh $REMOTE /usr/share/nginx/html/assets/manifest.json & nginx -g 'daemon off;'"]
EXPOSE 80
