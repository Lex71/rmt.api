# Reserve My Table (rmt.api)

rmt.api is a RESTful API server built with Express, MongoDB and TypeScript.  
The main goal is to allow an organization's restaurant to manage customer's bookings through a web app, as a replacement for traditional paper "book of reservations".

One server instance can handle all configured restaurants for the organization.
Basic case is an organization with just one restaurant.

## Features

- predefined admin user for the organization, who can define one or multiple restaurants, if any
- registration and login flow for staff users, bound to a specific restaurant
- JWT authentication and http-only cookie for refresh token flow
- forgot password flow, with 1-hour-expire token, sent within a link by email
- restaurant's tables configuration by staff users
- reservation handling at each of its statuses, from creation to customer's checkout
- prediction of available tables by inspecting currently reserved tables too, then applying a configurable "average staying time" to guess availability at the requested booking time, enhanced by a variable "ajust" parameter to try a different booking time, when no tables are available.

## Setup

Copy env.example to .env

MongoDB is run from docker. The first time a initialisation script gets run, to create the predefined _admin_ user, with password _admin_.

> NOTE: The default password can be changed by the _forgot password_ flow.

> NOTE: the "forgot password" feature, requires you to configure all SMTP\_\* variables

```bash
# install dependencies
npm i

# start mongoDB docker image
docker compose up -d

# serve with hot reload at localhost:8080
npm run dev


## Build

# build for production
npm run build

# run unit tests
npm run test

```

### Booking Flow (Client Side)

#### 1. Customer makes a reservation

##### 1.1. By Phone

A customer calls the restaurant, and provides information to the operator:

- reservaton date
- reservation time
- number of guests

###### 1.1.1. Operator is provided with a set of available tables, depending on date and time

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

###### 1.1.2. Operator selects a table

    When there are some available tables, operator marks the one(s) suitable for the number of guests.

> NOTE: if each available table has less than the desired number of guest, the operator can mark more tables.

##### 1.1.3 Registration

    Operator asks for further information in order to finalize the booking process:
    - customer name
    - customer phone

    A new reservation for such table(s) is now stored into database, with status "confirmed".

##### 1.2. By Web App

    (coming soon)

#### 2. Operator manages the reservation

##### 2.1. Customer shows up at the restaurant in time

    Operator updates the reservation with status CHECKEDIN

##### 2.2. After some time, customer still didn't show up

    Operator can update the reservation with status NOSHOW, freeing its related table(s).

#### 3. Customer pays the check

    Operator updates the reservation with status PAID

> NOTE: a reservation can also have RESCHEDULED status, though it is going to be hanlded as CONFIRMED.  
> This status could be useful for audit purposes.
