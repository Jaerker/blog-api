const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const app = express();

//Import routes
const authRoute = require('./routes/auth');
const blogRoute = require('./routes/blog');


const PORT = 3030 || process.env.PORT;


//Connect to db
mongoose.connect(process.env.DB_URL, 
    {useNewUrlParser: true}, 
    ()=>{
        console.log("Connected to db!");
    });

//Middlewares
app.use(express.json());


app.get('/', (req, res)=>{
    res.send("Working");
})

//Routes
app.use('/api/auth', authRoute);
app.use('/api/blog', blogRoute);









app.listen(PORT, ()=>{
    console.log("listening on " + PORT);
})