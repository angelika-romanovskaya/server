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


const {encrypt, decrypt} = require('./Encryption')



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
            res.send({status: "success", id: result[0][0].id});
        }
    });
});

app.post('/getpersoninfo', (req,res)=>{
    const {role, id} = req.body;
    if(role === "CLIENT") {
        db.query("select user.id as idUser, user.login, user.password, user.iv, client.id, client.name, client.surname, client.patronymic, client.email, client.phone from client join user on client.id_user = user.id where user.id = ?", [id], (err, result)=>{
            if(err){
                res.send({status: "error", error: err});
            } else{
                    result[0].password = decrypt({password: result[0].password, iv: result[0].iv})
                    res.send({status: "success", info: result[0]})
            }
        })
    } else if(role === "MANAGER"){
        db.query("select user.id as idUser, user.login, user.password, user.iv, manager.id, manager.name, manager.surname, manager.phone from manager join user on manager.id_user = user.id where user.id = ?", [id], (err, result)=>{
            if(err){
                res.send({status: "error", error: err});
            } else{
                    result[0].password = decrypt({password: result[0].password, iv: result[0].iv})
                    res.send({status: "success", info: result[0]})
            }
        })
    } else {
        db.query("select user.login, user.password, user.iv, user.id as idUser from user where user.id = ?", [id], (err, result)=>{
            if(err){
                res.send({status: "error", error: err});
            } else{
                    result[0].password = decrypt({password: result[0].password, iv: result[0].iv})
                    res.send({status: "success", info: result[0]})
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

app.post('/unblockedClient', (req,res)=>{
    const {id} = req.body;
    db.query("update client set client.status = 'active' where client.id = ?", [id], (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success"})
        }
    })
})

app.post("/deleteClient", (req, res)=>{
    const {id} = req.body;
    db.query("update client set client.status = 'deleted' where client.id_user = ?", [id], (err, result)=>{
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
                        res.send({status: "success", role: "CLIENT", id: user[0].id})
                    }
                });
            } else{
                res.send({status: "not found"})
            }
        }
    });
})

app.post("/addBell", (req, res)=>{
    const {password, login, theme, phone} = req.body;
    if(password === '' && login === ''){
        db.query("insert into calls(theme, phone) value(?,?)", [theme, phone], (err, result)=>{
            if(err){
                res.send({status: "error", error: err});
            } else{
                res.send({status: "success"});
            }
        })
    } else{
        db.query("select * from user", (err, result)=>{
            if(err) {
                res.send({status: "error", error: err});
            } else{
                let user =  result.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
                if(user.length !== 0){
                    db.query("insert into calls(id_client, theme) value((select id from client where id_user = ?),?)", [user[0].id, theme], (err, result)=>{
                        if(err){
                            res.send({status: "error", error: err});
                        } else{
                            res.send({status: "success"});
                        }
                    })
                }
            }
        })
    }
})

app.get('/getbell', (req,res)=>{
    db.query("select id, theme, 'anonymous' as name, phone as phone from calls where id_client is null union select calls.id, calls.theme, concat(client.name, ' ', client.surname) as name, client.phone as phone from calls join client on calls.id_client = client.id where calls.id_client is not null", (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success", calls: result})
        }
    })
});

app.post('/addbid', (req, res)=>{
    const {id, type, description, typeUser, dataStart} = req.body;
    let id_manager;

    db.query("select user.id as id_manager, COUNT(*) as 'количество заявок в обработке' from user left outer join bid on user.id = bid.id_manager where user.id_role = 2 group by user.id order by COUNT(*)", (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            if(result.length !== 0){
                id_manager = result[0].id_manager;
            }
        }
    })

    db.query("select * from user where id = ? or id_role = 2", [id], (err, result)=>{
        if(err) {
            res.send({status: "error", error: err});
        } else{
            let user =  result.filter(elem => elem.id === id);
            let manager = result.filter(elem=>elem.id_role === 2);
            if(id_manager === undefined){
                id_manager = manager[0].id;
            }
            db.query('call addBid(?,?,?,?,?,?)', [user[0].id, type, description, id_manager, typeUser, dataStart], (err, result)=>{
                if(err){
                    res.send({status: "error", error: err});
                } else{
                    res.send({status: "success"})
                }
            })
        }
    });
});

app.post('/getBid', (req,res)=>{
    const {id, role} = req.body;
    if(role === "CLIENT"){
        db.query("select DATE_FORMAT(bid.data_start, '%Y-%m-%d') as data_start, DATE_FORMAT(bid.data_end, '%Y-%m-%d') as data_end, bid.id, bid.price, status.status, bid.msg, manager.name, manager.surname, bid.id_status, bid.type, bid.description from bid join manager on bid.id_manager = manager.id_user join user on manager.id_user = user.id join status on status.id = bid.id_status where bid.id_client = ?", [id], (err, results)=>{
            if(err){
                console.log(err)
                res.send({status: "error", error: err});
            } else{
                res.send({status: "success", bid: results})
            }
        })
    } else if(role === "MANAGER"){
        db.query("select DATE_FORMAT(bid.data_start, '%Y-%m-%d') as data_start, DATE_FORMAT(bid.data_end, '%Y-%m-%d') as data_end, bid.price, bid.type_user, bid.id, status.status, client.name, client.surname, client.phone, client.email, bid.id_status, bid.type, bid.description from bid join client on bid.id_client = client.id_user join user on client.id_user = user.id join status on status.id = bid.id_status where bid.id_manager = ? and not bid.id_status = 5", [id], (err, result)=>{
            if(err){
                console.log(err)
                res.send({status: "error", error: err});
            } else{
                console.log(result)
                res.send({status: "success", bid: result})
            }
        })
    } else{
        db.query("select DATE_FORMAT(bid.data_start, '%Y-%m-%d') as data_start, DATE_FORMAT(bid.data_end, '%Y-%m-%d') as data_end, bid.price, bid.type_user, bid.id, manager.name as nameManager, manager.surname as surnameManager, status.status, client.name, client.surname, client.phone, client.email, bid.id_status, bid.type, bid.description from bid join client on client.id_user = bid.id_client join status on status.id = bid.id_status join manager on bid.id_manager = manager.id_user where bid.id_status = 3", (err, result)=>{
            if(err){
                console.log(err)
                res.send({status: "error", error: err});
            } else{
                console.log(result)
                res.send({status: "success", bid: result})
            }
        })
    }
});

app.post('/viewedBid', (req,res)=>{
    const {id} = req.body;
    db.query("update bid set id_status = 2 where id_status = 1 and id=?",[id], (err,result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success"})
        }
    })
})

app.post('/deletedBid', (req,res)=>{
    const {id} = req.body;
    db.query("delete from bid where id=?",[id], (err,result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success"})
        }
    })
})

app.post('/approveBid', (req,res)=>{
    const {id, msg, role, data_end, price} = req.body;
    if(role === "MANAGER"){
        db.query("update bid set bid.price = ?, bid.id_status = 3, bid.msg = ?, bid.data_end = ? where id=?",[price, msg, data_end, id], (err,result)=>{
            if(err){
                console.log(err)
                res.send({status: "error", error: err});
            } else{
                res.send({status: "success"})
            }
        })
    } else{
        db.query("update bid set bid.id_status = 6, bid.msg = ? where id=?",[msg,id], (err,result)=>{
            if(err){
                console.log(err)
                res.send({status: "error", error: err});
            } else{
                res.send({status: "success"})
            }
        })
    }
})

app.post('/rejectBid', (req,res)=>{
    const {id,msg} = req.body;
    db.query("update bid set bid.id_status = 5, bid.msg = ? where id=?",[msg,id], (err,result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success"})
        }
    })
})

app.get('/summaryBid', (req,res)=>{
    let manager = [];
    db.query("select bid.id_manager, manager.name, manager.surname, manager.phone, SUM(bid.price) as sum from bid  join manager on bid.id_manager  = manager.id_user where not bid.id_status = 5 group by bid.id_manager", (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            manager = [...result]
            let client = [];
            db.query("select bid.id_client, client.name, client.surname, client.phone, client.email, SUM(bid.price) as sum from bid  join client on bid.id_client = client.id_user where not bid.id_status = 5 group by bid.id_client", (err, results)=>{
                if(err){
                    res.send({status: "error", error: err});
                } else{
                    client = [...results]
                    res.send({status: "success", manager: manager, client: client})
                }
            })
        }
    })
});

app.get('/sumPrice', (req,res)=>{
    db.query("select SUM(bid.price) as sum from bid", (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        }else {
            res.send({status: "success", sum: result[0]})
        }
    })
});

app.post('/deleteCalls', (req,res)=>{
    const {id} = req.body;
    db.query("delete from calls where id=?",[id], (err,result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            res.send({status: "success"})
        }
    })
})

app.get('/getChartManagerAdmin', (req,res)=>{
    let manager = [];
    let bid = [];
    db.query("select concat(manager.name, ' ', manager.surname) as fullname, count(*) as count from manager join bid on bid.id_manager = manager.id_user where not bid.id_status = 5 group by manager.id_user", (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        }else {
            result.forEach(el => {manager.push(el.fullname); bid.push(el.count)})
            res.send({status: "success", manager: manager, bid: bid})
        }
    })
});

app.get('/getChartClientAdmin', (req,res)=>{
    let client = [];
    let bid = [];
    db.query("select bid.type_user as user, count(*) as count from bid group by bid.type_user", (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        }else {
            result.forEach(el => {client.push(el.user); bid.push(el.count)})
            res.send({status: "success", client: client, bid: bid})
        }
    })
});

app.post('/getReport', (req,res)=>{
    let {start, end} = req.body;
    let bid = [];
    let sumBid = 0;
    let bidStatus = [];
    db.query("select count(*) as count from bid where bid.data_start between ? and ?", [start, end], (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        }else {
            sumBid = result[0].count;
        }
    })
    db.query("select count(*) as count, status from bid join status on bid.id_status = status.id where bid.data_start between ? and ? group by bid.id_status", [start, end], (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        }else {
            bidStatus = [...result]
        }
    })
    db.query("select concat(manager.name, ' ', manager.surname) as fullname, type_user, sum(price) as price, count(*) as count from bid join manager on bid.id_manager = manager.id_user where bid.data_start between ? and ? group by bid.id_manager, bid.type_user", [start, end], (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        }else {
           bid = [...result]
           res.send({status: "success", sumBid : sumBid, bid : bid, bidStatus:bidStatus})
        }
    })
});

app.post('/topManagers', (req,res)=>{
    const {dateStart, dateEnd} = req.body;
    db.query("select concat(manager.name, ' ', manager.surname) as fullname, count(*) as count, sum(price) as price from bid join manager on bid.id_manager = manager.id_user where bid.id_status = 6 group by bid.id_manager", [dateStart, dateEnd], (err, result)=>{
        if(err){
            res.send({status: "error", error: err});
        } else{
            result.sort((a,b)=>b.price - a.price);
            result.length = result.length > 3 ?  3 : result.length;
            console.log(result)
            res.send({status: "success", manager : result})
        }
    })
})