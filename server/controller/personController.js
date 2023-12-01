const { QueryTypes } = require('sequelize');
const db = require('../config/config')
const {encrypt, decrypt} = require('../function/Encryption')

class PersonController{
    async getInfo(req,res){
        try {
            const {role, id} = req.body;
            if(role === "CLIENT") {
                let result = await db.query("select users.id as idUser, users.login, users.password, users.iv, clients.id, clients.name, clients.surname, clients.patronymic, clients.email, clients.phone from clients join users on clients.userId = users.id where users.id = ?", {replacements: [id], type:QueryTypes.SELECT})
                result[0].password = decrypt({password: result[0].password, iv: result[0].iv})
                res.send({status: "success", info: result[0]})
            } else if(role === "MANAGER"){
                let result = await db.query("select users.id as idUser, users.login, users.password, users.iv, managers.id, managers.name, managers.surname, managers.phone from managers join users on managers.userId = users.id where users.id = ?", {replacements: [id], type:QueryTypes.SELECT})
                result[0].password = decrypt({password: result[0].password, iv: result[0].iv})
                res.send({status: "success", info: result[0]})
            } else {
                let result = await db.query("select users.login, users.password, users.iv, users.id as idUser from users where users.id = ?", {replacements: [id], type:QueryTypes.SELECT})
                result[0].password = decrypt({password: result[0].password, iv: result[0].iv})
                res.send({status: "success", info: result[0]})
            }
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async updateInfo(req,res){
        try {
            const {id, role, password, login, name, surname, patronymic, phone, email} = req.body;
            const hachedPassword = encrypt(password);
            if(role === "CLIENT") {
                await db.query("call updateClient(?,?,?,?,?,?,?,?,?)", {replacements:[id, login, hachedPassword.password, name, surname, patronymic, phone, email, hachedPassword.iv],  type:QueryTypes.UPDATE})
                res.send({status: "success"});
            } else if(role === "MANAGER"){
                await db.query("call updateManager(?,?,?,?,?,?,?)", {replacements: [id, login, hachedPassword.password, name, surname, phone, hachedPassword.iv], type:QueryTypes.UPDATE})
                res.send({status: "success"});
            } else{
                await db.query("call updateAdmin(?,?,?,?)",  {replacements: [id, login, hachedPassword.password, hachedPassword.iv], type:QueryTypes.UPDATE})
                res.send({status: "success"});
            }
        } catch (error) {
            if(error.code === "ER_DUP_ENTRY") {
                res.send({status: "duplicate"});
            } else{
                res.send({status: "error", error: error});
            }
        }
    }
}

module.exports = new PersonController()