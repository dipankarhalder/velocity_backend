const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const dbConnect = require('./config/db.config');
const env = require('./config/env.config');
const router = require('./routes');
const { globalError, missingRoutes } = require('./utils/core.utils');

const app = express();
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

app.use(morgan(env.PLATFORM));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', router);
app.use((req, res, next) => missingRoutes(req, res, next));
app.use((error, req, res) => globalError(res, error));

dbConnect()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server successfully started on port: ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database failed to connect.', err);
    process.exit(1);
  });
