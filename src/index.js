const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { env } = require('./config/env.config');
const { db } = require('./config/db.config');
const { core } = require('./utils/core.utils');
const { rootApiRouter } = require('./routes');

/* initial express app */
const app = express();

/* CORS configuration */
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

/* all important middleware */
app.use(morgan(env.PLATFORM));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* Serve static files from /uploads */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* application main endpoint */
app.use('/api', rootApiRouter);

/* missing routes and globally errors */
app.use((req, res, next) => core.missingRoutes(req, res, next));
app.use((error, req, res) => core.globalError(res, error));

/* connect database and started server */
db.dbConnect()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server successfully started on port: ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database failed to connect.', err);
    process.exit(1);
  });
