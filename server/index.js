const express = require('express')
const app = express();
const mysql = require('mysql2')
const cors = require('cors')
const bp = require('body-parser');

const {encrypt, decrypt} = require('./Encryption')

const PORT = 9090
app.use(cors())
app.use(bp.json())

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: 'QWE123123',
    database: 'filesmanager'
});

app.get('/',(req,res)=>{
    res.end("Hello")
})

app.post('/login', (req, res)=>{
    const {password, login} = req.body;
    db.query("select * from user", (err, result)=>{
        if(err) {
            console.log(err);
        } else{
            result.forEach(elem=>{
                if(decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login){
                    db.query("select role from role where id = ?", [elem.id_role], (err, result)=>{
                        if(err){
                            console.log(err);
                        } else{
                            res.send({status: "success", role: result[0].role})
                        }
                    })
                } else{
                    res.send({status: "not found"})
                }
            })
        }
    });
});

app.post('/registration', (req, res)=>{
    const {password, login, name, surname, patronymic, email, phone} = req.body;
    const hachedPassword = encrypt(password);
    db.query("call addClient(?,?,?,?,?,?,?,?)", [login, hachedPassword.password, name, surname, patronymic, email, phone, hachedPassword.iv], (err, result)=>{
        if(err){
            console.log(err);
        } else{
            res.send("Success");
        }
    });
});

app.listen(PORT, ()=>{
    console.log("Server is running");
});