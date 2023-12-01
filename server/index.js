require('dotenv').config();
const express = require('express')
const db = require('./config/config')
const model = require('./model/models')
const cors = require('cors')
const bp = require('body-parser');
const router = require('./routes/index')

const PORT = process.env.PORT || 9090

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(bp.json());
app.use('/app', router);

const start = async ()=>{
    try {
        await db.authenticate()
        await db.sync()
        app.listen(PORT, ()=>{
            console.log(`Server is running ${PORT}`);
        });
    } catch (error) {
        console.log(error)
    }
}

start();

app.get('/',(req,res)=>{
    res.end("Hello")
})