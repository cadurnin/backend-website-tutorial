const dotenv = require('dotenv');
dotenv.config({path: './config.env',});
const app = require('./app');
const mongoose = require('mongoose');

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }).then(() =>
   //.log('Connection successful')
  );

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}... `);
});

process.on("uncaughtException", err => {
  //console.log(err.name, err.message);
  process.exit(1);

})

process.on('unhandledRejection', err => {
  //console.log(err.name, err.message);
  //console.log('Unhandled Rejection, shutting down');
  server.close(() => {
    process.exit(1);
  });
  
})