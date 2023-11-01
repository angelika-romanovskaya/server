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
            res.send({status: "error", error: err});
        } else{
            let user =  result.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
            if(user.length !== 0){
                db.query("select role.role from role where role.id = ?", [user[0].id_role], (err, result)=>{
                    if(err){
                        res.send({status: "error", error: err});
                    } else{
                        res.send({status: "success", role: result[0].role})
                    }
                });
            } else{
                    res.send({status: "not found"})
            }
        }
    });
});

app.post('/registration', (req, res)=>{
    const {password, login, name, surname, patronymic, email, phone} = req.body;
    const hachedPassword = encrypt(password);
    db.query("call addClient(?,?,?,?,?,?,?,?)", [login, hachedPassword.password, name, surname, patronymic, email, phone, hachedPassword.iv], (err, result)=>{
        if(err){
            if(err.code === "ER_DUP_ENTRY") {
                res.send({status: "duplicate"});
            } else{
                res.send({status: "error", error: err});
            }
        } else{
            res.send({status: "success"});
        }
    });
});

app.post('/addmanager', (req, res)=>{
    const {password, login, name, surname, phone} = req.body;
    const hachedPassword = encrypt(password);
    db.query("call addManager(?,?,?,?,?,?)", [login, hachedPassword.password, name, surname, phone, hachedPassword.iv], (err, result)=>{
        if(err){
            if(err.code === "ER_DUP_ENTRY") {
                res.send({status: "duplicate"});
            } else{
                res.send({status: "error", error: err});
            }
        } else{
            res.send({status: "success"});
        }
    });
});

app.get('/getmanagers', (req,res)=>{
    db.query("select * from manager", (err, result)=>{
        console.log(result);
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success", managers: result})
        }
    })
});

app.post('/deleteManager', (req,res)=>{
    const {id} = req.body;
    db.query("delete user from user join manager on user.id = manager.id_user where manager.id = ?", [id], (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success"})
        }
    })
})

app.listen(PORT, ()=>{
    console.log("Server is running");
});