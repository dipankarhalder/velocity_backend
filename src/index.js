const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { env, db } = require('./config');
const { core } = require('./utils');
const { rootApiRouter } = require('./routes');

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
app.use('/api', rootApiRouter);
app.use((req, res, next) => core.missingRoutes(req, res, next));
app.use((error, req, res) => core.globalError(res, error));

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
