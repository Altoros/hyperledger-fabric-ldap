# ========= Base =========
FROM node:8-stretch-slim as Base

# Change working directory
RUN mkdir -p /app
WORKDIR /app
ENV PARCEL_WORKERS=1

# Update packages and install dependency packages for services
RUN apt-get update

RUN DEBIAN_FRONTEND=noninteractive apt-get -yq install python make gcc g++

RUN apt-get clean \
 && echo 'Finished installing dependencies'


COPY package.json yarn.lock ./

# ========= Deps =========
FROM Base as Deps
# Install dependencies
RUN yarn

# ========= Client =========
FROM Base as Client

# Copy dependencies
COPY --from=Deps /app/node_modules ./node_modules
# Copy remaining client's source files
COPY client ./client
COPY parcel.js .babelrc ./
COPY common ./common

# Build web-client
RUN node parcel.js

# ========= Final =========
FROM Base as Final

# Copy dependencies
COPY --from=Deps /app/node_modules ./node_modules
# Copy client
COPY --from=Client /app/dist ./dist

# Copy remaining server's source files
COPY server ./server
COPY common ./common

EXPOSE 4000

# Serve app
CMD [ "yarn", "start:prod" ]

