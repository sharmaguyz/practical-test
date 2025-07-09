require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3001;
var apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const instructorRouter = require('./routes/instructor');
const orderRouter = require('./routes/order');
const path = require("path");
app.use(cors());
const webhookRoute = require('./routes/webhook');
app.use(`/api/${process.env.API_VERSION}/order`, webhookRoute);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use(`/api/${process.env.API_VERSION}`, apiRouter);
app.use(`/api/${process.env.API_VERSION}/admin`, adminRouter);
app.use(`/api/${process.env.API_VERSION}/user`, userRouter);
app.use(`/api/${process.env.API_VERSION}/instructor`, instructorRouter);
app.use(`/api/${process.env.API_VERSION}/order`, orderRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.clear()
});