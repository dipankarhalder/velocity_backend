const mongoose = require('mongoose');
const { MONGOURI } = require('./env.config');

const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(MONGOURI);
    console.log('Database successfully connected on port: 27017.');
    return connect;
  } catch (err) {
    console.log(`Database failed to connect. ${err.message}`);
    process.exit(1);
  }
};

module.exports = dbConnect;
