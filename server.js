var express = require('express');
const mongoose = require("mongoose");
var bodyParser = require('body-parser')

const users = require("./routes/api/user");

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

var app = express();

app.use(express.static('public'));
app.set("view engine", "ejs");
app.set("views", "./views");

const server = require("http").Server(app);
const port = 80;
server.listen(port, () => console.log('Server running...'));

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
            servers: 'http://localhost',
        }
    },
    apis: ["document.yaml"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/document", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://mongo:27017/chitchat-server', // mongodb://localhost:27017/chitchat-server
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
