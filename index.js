const mongoose = require('mongoose');

const express = require('express');
const bodyParser = require('body-parser');
const querystring = require('querystring');

//routes
const album = require("./routes/album");
const photo = require("./routes/photo");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MongoDB
// TODO: expose mogo url as env variable
mongoose
  .connect(
    `mongodb://mongo:27017/image-store`,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use("/album", album);
app.use("/photo", photo);

const port = 3000;

app.listen(port, () => console.log('Server running...'));
