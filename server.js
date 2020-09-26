var express = require('express');
const mongoose = require("mongoose");
var bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const users = require("./routes/api/user");

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

var app = express();

var path=require('path');
app.use("/public", express.static(path.join(__dirname,'public')));
app.set("view engine", "ejs");
app.set("views", "./views");

const server = require("http").Server(app);
server.listen(80, () => console.log('Server running...'));

// connect(io);
// connect(iohttps);

const port = process.env.PORT || 443;
https.createServer({
  key: fs.readFileSync('./ssl/private.key'),
  cert: fs.readFileSync('./ssl/certificate.crt'),
  ca: [
    fs.readFileSync('./ssl/ca_bundle.crt')
  ]
  //passphrase: 'abcd'
}, app)
  .listen(port);


// Document
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "ChitChat's API",
            description: 'ChitChat is a realtime chat application developed by @lesonnnn',
            version: '1.0.0',
            contact: {
                name: ': lesonitdn98@gmail.com',
                email: 'lesonitdn98@gmail.com'
            },
            servers: 'https://leson.tech',
        }
    },
    apis: ["document.yaml"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/document", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://localhost:27017/chitchat-server', // mongodb://mongo:27017/chitchat-server
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Page Home
app.get("/", function(req, res) {
   res.render("home");
});

// API
app.use(bodyParser.json()); // support json encoded bodies
app.use("/api/user", users)
