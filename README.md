# Reserve My Table (rmt.api)

rmt.api is a RESTful API server built with Express, MongoDB and TypeScript.  
The main goal is to allow an organization's facility to manage customer's bookings through a web app, as a replacement for traditional paper "book of reservations".

One server instance can handle all configured restaurants for the organization.
Basic case is an organization with just one restaurant.

## Features

- predefined admin user for the organization
- definition of one or more _facilitiies_ (by admin user only)
- registration flow for staff users, bound to a specific _facility_
- login, logout, change password flows for all users
- JWT authentication and http-only cookie for refresh token flow
- forgot password flow, with 1-hour-expire token, sent as clickable link by email
- api payloads validation
- _facilities_ CRUD by admin only
- _tables_ CRUD by staff users
- _reservations_ handling by staff users, based on status
- available tables forecast (\*)

> (\*) for tables already reserved, we try to predict if a table will be available, say for the given booking time, by applying a configurable "average staying time" then matching the busy time interval against the booking time interval.

## Setup

Copy env.example to .env  
In order to work with MongoDB, you first need to have a MondoDB server running.  
For convenience, you can build and spin up a container as defined in docker-compose.yaml file:

```bash
docker compose up --build -d
```

The very first time the container is run, the _init-mongo-db-with-collections.js_ script also runs and creates the following collections:

- _users_
- _facilities_
- _tables_
- _reservations_

> NOTE: the init script runs only if process.env.NODE_ENV !== "production"

The init script also creates the administrator user:

- user: _admin_
- password: _admin_

The default admin's password can be changed with the _forgot password_ flow.

> NOTE: in order to use the "forgot password" flow, you must configure all SMTP\_\* variables

In production environment, depending on your case, you may want a mongodb cloud service,
so this setup may require some tweaks.

### Use mongosh

```bash
docker exec -it rmtapi-db-1 mongosh -u root -p

show databases

use reserve-my-table

show tables

# explain queries
db.facilities.find({name: "Facility One"}).explain("executionStats")
```

### Backup DB Volume

```bash
# mongodump
docker exec -it rmtapi-db-1 /usr/bin/mongodump --uri mongodb://root:password@localhost:27017/reserve-my-table --archive=db.bson
# copy from container to host
docker cp rmtapi-db-1:/db.bson /home/luca/Desktop/db.bson
```

### Restore DB Volume

```bash
# copy from host to container
docker cp /home/luca/Desktop/db.bson rmtapi-db-1:/
# mongorestore
docker exec -it rmtapi-db-1 /usr/bin/mongorestore --uri mongodb://root:password@localhost:27017 --archive=db.bson
```

## Install

```bash
# install dependencies
npm i

# start mongoDB docker image
docker compose up -d

# serve with hot reload at localhost:_PORT_
npm run dev


## Build

# build for production
npm run build

# run unit tests
npm run test

```

## Booking Flow (Client Side)

### 1. Customer makes a reservation

#### 1.1. By Phone

A customer calls the restaurant, and provides information to the operator:

- reservaton date
- reservation time
- number of guests

##### 1.1.1. Operator is provided with a set of available tables, depending on date and time

The operator searches for tables availabilty (async all to server), and if no tables are found tries with a slightly different time.

> NOTE: this can be quickly achieved by changing the _adjust_ parameter, adding/subtracting 15 minutes each time, then searches again (another async call to server), until tables are found.

Tables in the result come from:

- all tables that are not yet included in any reservation
- tables included in reservations for that date having a status PAID or NOSHOW or CANCELLED
- tables included in reservations for that date having a status CONFIRMED or RESCHEDULED or CHECKEDIN and range (time, time + DELAY) not overlapping with range (booking_time, booking_time + DELAY)

> NOTE: DELAY is a configurable parameter representing customer's average staying time, in minutes.

> EXAMPLES  
>  DELAY is 90 minutes, and the new booking time is 14:00, then a table whose status is CONFIRMED or CHECKEDIN that has been reserved for 12:00, will be included in the list (because the customer will probably pay at 13:30, so table is free)  
>  DELAY is 90 minutes, and the new booking time is 14:00, then a table whose status is CONFIRMED or CHECKEDIN that has been reserved for 13:00, will not be included in the list (because the customer will probably pay at 13:30, so table is still busy)

##### 1.1.2. Operator selects a table

    When there are some available tables, operator marks the one(s) suitable for the number of guests.

> NOTE: if each available table has less than the desired number of guest, the operator can mark more tables.

#### 1.1.3 Registration

    Operator asks for further information in order to finalize the booking process:
    - customer name
    - customer phone

    A new reservation for such table(s) is now stored into database, with status "confirmed".

#### 1.2. By Web App

    (coming soon)

### 2. Operator manages the reservation

#### 2.1. Customer shows up at the restaurant in time

    Operator updates the reservation with status CHECKEDIN

#### 2.2. After some time, customer still didn't show up

    Operator can update the reservation with status NOSHOW, freeing its related table(s).

### 3. Customer pays the check

    Operator updates the reservation with status PAID

> NOTE: a reservation can also have RESCHEDULED status, though it is going to be hanlded as CONFIRMED.  
> This status could be useful for audit purposes.

## Microservices (refactor)

[ref: Medium](https://medium.com/@azizmarzouki/mastering-microservices-with-node-js-a-step-by-step-guide-0aa0020cd27a)

Looking forward to extend functionalities other than table reservations, e.g. in-facility orders or online takeaways and so on, project could be refactored creating a higher folder level inside the git repository:

- booking-service/, where to move (actual) reservations project files
- order-service/, where add orders related project files
- other-service
- communicator

The communicator module is going to handle inter-process communication

```js
// communicator/index.js
const axios = require("axios");

class Communicator {
  constructor() {
    this.userServiceClient = axios.create({
      baseURL: "http://localhost:3001/api",
    });
    this.productServiceClient = axios.create({
      baseURL: "http://localhost:3002/api",
    });
    this.orderServiceClient = axios.create({
      baseURL: "http://localhost:3003/api",
    });
  }
  async getTables() {
    const response = await this.userServiceClient.get("/tables");
    return response.data;
  }
  async getProducts() {
    const response = await this.productServiceClient.get("/products");
    return response.data;
  }
  async getOrders() {
    const response = await this.orderServiceClient.get("/orders");
    return response.data;
  }
}
module.exports = new Communicator();
```

The communicator can be used inside our microservices' controllers, for example /api/orders could neet to fetch the products and the users

```js
// order-service/src/api/orders/orders.controller.ts

const communicator = require("../../communicator");

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await communicator.getOrders();
    const users = await communicator.getUsers();
    const products = await communicator.getProducts();

    const detailedOrders = orders.orders.map((order) => {
      const user = users.users.find((u) => u.id === order.user_id);
      const product = products.products.find((p) => p.id === order.product_id);
      return { ...order, user, product };
    });

    res.json({ orders: detailedOrders });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
```

## Order Flow (TBD)

Any allowed operator can fill the order based on the reservation's table.

First, define a Products model, like:

## Open API

View the [OAS](./oas.yaml) source file.

TODO:

- create unit test for users.service's findByEmail() function
