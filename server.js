import express from "express";
import { bootstrap } from "./src/bootstrap.js";
import { startReminderCron } from "./src/services/reminderCron.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  if (req.originalUrl === "/micro/v1/webhooks/stripe") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json({ limit: "20mb" })(req, res, next);
  }
});
app.get('/', (req, res) => {
    res.status(200).send('System is active');
});


bootstrap(app);
startReminderCron();