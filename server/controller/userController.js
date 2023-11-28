class UserController{
    async registration(req,res){

    }

    async login(req,res){
        const {password, login} = req.body;
        db.query("select * from users", (err, result)=>{
        if(err) {
            res.send({status: "error", error: err});
        } else{
            let user =  result.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
            if(user.length !== 0){
                db.query("select roles.role from roles where roles.id = ?", [user[0].id_role], (err, result)=>{
                    if(err){
                        res.send({status: "error", error: err});
                    } else{
                        if(result[0].role === "CLIENT"){
                            db.query("select status from clients where clients.id_user = ?", [user[0].id], (err, results)=>{
                                if(err){
                                    res.send({status: "error", error: err});
                                } else{
                                    res.send({status: "success", role: result[0].role, client_status: results[0].status, id: user[0].id})
                                }
                            })
                        } else{
                            res.send({status: "success", role: result[0].role, id: user[0].id})
                        }
                    }
                });
            } else{
                res.send({status: "not found"})
            }
        }
        })
    }
}

module.exports = new UserController();