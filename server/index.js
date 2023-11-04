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
                        if(result[0].role === "CLIENT"){
                            db.query("select status from client where client.id_user = ?", [user[0].id], (err, results)=>{
                                if(err){
                                    res.send({status: "error", error: err});
                                } else{
                                    res.send({status: "success", role: result[0].role, client_status: results[0].status})
                                }
                            })
                        } else{
                            res.send({status: "success", role: result[0].role})
                        }
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

app.post('/getpersoninfo', (req,res)=>{
    const {role, password, login} = req.body;
    if(role === "CLIENT") {
        db.query("select user.login, user.password, user.iv, client.id, client.name, client.surname, client.patronymic, client.email, client.phone from client join user on client.id_user = user.id", (err, result)=>{
            if(err){
                res.send({status: "error", error: err});
            } else{
                let info =  result.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
                if(info.length !== 0){
                    info[0].password = decrypt({password: info[0].password, iv: info[0].iv})
                    res.send({status: "success", info: info[0]})
                } else{
                    res.send({status: "error"})
                }
            }
        })
    } else if(role === "MANAGER"){
        db.query("select user.login, user.password, user.iv, manager.id, manager.name, manager.surname, manager.phone from manager join user on manager.id_user = user.id", (err, result)=>{
            if(err){
                res.send({status: "error", error: err});
            } else{
                let info =  result.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
                if(info.length !== 0){
                    info[0].password = decrypt({password: info[0].password, iv: info[0].iv})
                    res.send({status: "success", info: info[0]})
                } else{
                    res.send({status: "error"})
                }
            }
        })
    } else {
        db.query("select user.login, user.password, user.iv, user.id from user", (err, result)=>{
            if(err){
                res.send({status: "error", error: err});
            } else{
                let info =  result.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
                if(info.length !== 0){
                    info[0].password = decrypt({password: info[0].password, iv: info[0].iv})
                    res.send({status: "success", info: info[0]})
                } else{
                    res.send({status: "error"})
                }
            }
        })
    }
})

app.post('/updatepersoninfo', (req, res)=>{
    const {id, role, password, login, name, surname, patronymic, phone, email} = req.body;
    const hachedPassword = encrypt(password);
    if(role === "CLIENT") {
        db.query("call updateClient(?,?,?,?,?,?,?,?,?)", [id, login, hachedPassword.password, name, surname, patronymic, phone, email, hachedPassword.iv], (err, result)=>{
            if(err){
                if(err.code === "ER_DUP_ENTRY") {
                    res.send({status: "duplicate"});
                } else{
                    res.send({status: "error", error: err});
                }
            } else{
                res.send({status: "success"});
            }
        })
    } else if(role === "MANAGER"){
        db.query("call updateManager(?,?,?,?,?,?,?)", [id, login, hachedPassword.password, name, surname, phone, hachedPassword.iv], (err, result)=>{
            if(err){
                if(err.code === "ER_DUP_ENTRY") {
                    res.send({status: "duplicate"});
                } else{
                    res.send({status: "error", error: err});
                }
            } else{
                res.send({status: "success"});
            }
        })
    } else{
        db.query("call updateAdmin(?,?,?,?)", [id, login, hachedPassword.password, hachedPassword.iv], (err, result)=>{
            if(err){
                if(err.code === "ER_DUP_ENTRY") {
                    res.send({status: "duplicate"});
                } else{
                    res.send({status: "error", error: err});
                }
            } else{
                res.send({status: "success"});
            }
        })
    }
})

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

app.get('/getclients', (req,res)=>{
    db.query("select client.id, client.name, client.surname, client.patronymic, client.email, client.phone, client.status, user.login from client join user where client.id_user = user.id", (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success", clients: result})
        }
    })
});

app.post('/blockedClient', (req,res)=>{
    const {id} = req.body;
    db.query("update client set client.status = 'blocked' where client.id = ?", [id], (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success"})
        }
    })
})

app.post("/deleteClient", (req, res)=>{
    const {id} = req.body;
    db.query("update client set client.status = 'deleted' where client.id = ?", [id], (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success"})
        }
    })
})

app.post("/restoreClient", (req, res)=>{
    const {password, login} = req.body;
    db.query("select * from user", (err, result)=>{
        if(err) {
            res.send({status: "error", error: err});
        } else{
            let user =  result.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
            if(user.length !== 0){
                db.query("update client set client.status = 'active' where client.id_user = ?", [user[0].id], (err, result)=>{
                    if(err){
                        res.send({status: "error", error: err});
                    } else{
                        res.send({status: "success", role: "CLIENT"})
                    }
                });
            } else{
                res.send({status: "not found"})
            }
        }
    });
})

app.listen(PORT, ()=>{
    console.log("Server is running");
});