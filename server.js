const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const app = express();
const cors = require('cors');
//Import routes
const authRoute = require('./routes/auth');
const blogRoute = require('./routes/blog');


const PORT = process.env.PORT;


//Connect to db
mongoose.connect(process.env.DB_URL, 
    {useNewUrlParser: true}, 
    ()=>{
        console.log("Connected to db!");
    });

//Middlewares
app.use(express.json());
app.use(cors({
    origin: [process.env.CORS_ORIGIN, process.env.TEST_ORIGIN],
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: ['Content-Type', 'auth-token'],

}));



//Routes
app.use('/api/auth', authRoute);
app.use('/api/blog', blogRoute);


app.listen(PORT, ()=>{
    console.log("listening on " + PORT);
})