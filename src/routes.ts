import authRouter from "./api/auth";
import facilityRouter from "./api/facilities";
import homeRouter from "./api/home";
import passwordRouter from "./api/passwords";
import refreshTokenRouter from "./api/refresh-token";
import reservationRouter from "./api/reservations";
import tableRouter from "./api/tables";

// // wire up to the express app
// app.use('/api/books', facilitiesRoutes);
export {
  authRouter,
  facilityRouter,
  homeRouter,
  passwordRouter,
  refreshTokenRouter,
  reservationRouter,
  tableRouter,
};
