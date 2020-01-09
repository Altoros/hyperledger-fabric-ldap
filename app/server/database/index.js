const mongoose = require('mongoose');

const {
    DB_HOST = 'localhost',
    DB_PORT = '27017',
    DB_USER,
    DB_PASSWORD,
    DB_NAME = 'example'
} = process.env;

module.exports = () =>
  mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
    user:   DB_USER,
    pass: DB_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });
