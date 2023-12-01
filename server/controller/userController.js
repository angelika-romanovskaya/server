const db = require('../config/config')
const {encrypt, decrypt} = require('../function/Encryption')
const {QueryTypes} = require('sequelize')
class UserController{
    async registration(req,res){
        try {
            const {password, login, name, surname, patronymic, email, phone} = req.body;
            const hachedPassword = encrypt(password);
            let result = await db.query("call addClient(?,?,?,?,?,?,?,?)", {replacements:[login, hachedPassword.password, name, surname, patronymic, email, phone, hachedPassword.iv], type: QueryTypes.INSERT})
            res.send({status: "success", id: result[0].id});
        } catch (error) {
            if(error.code === "ER_DUP_ENTRY") {
                res.send({status: "duplicate"});
            } else{
                res.send({status: "error", error: error});
            }
        }
    }

    async login(req,res){
        try {
        const {password, login} = req.body;
        let users = await db.query("select * from users", {type: QueryTypes.SELECT})
        if(users.length !== 0) {
            let user = users.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
            if(user.length !== 0){
                let role = await db.query("select roles.role from roles where roles.id = ?",{ replacements: [user[0].roleId], type: QueryTypes.SELECT});
                if(role[0].role === "CLIENT"){
                    let status = await db.query("select status from clients where clients.userId = ?", {replacements:[user[0].id], type: QueryTypes.SELECT})
                    res.send({status: "success", role: role[0], client_status: status[0].status, id: user[0].id})
                } else{
                    res.send({status: "success", role: role[0], id: user[0].id})
                }
            } else{
                res.send({status: "not found"})
            }
        }
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }
}

module.exports = new UserController();