const { QueryTypes } = require('sequelize');
const db = require('../config/config')
const {Manager} = require('../model/models')
const {encrypt, decrypt} = require('../function/Encryption')

class ManagerController{
    async add(req,res){
        try {
            const {password, login, name, surname, phone} = req.body;
            const hachedPassword = encrypt(password);
            await db.query("call addManager(?,?,?,?,?,?)", {replacements: [login, hachedPassword.password, name, surname, phone, hachedPassword.iv], type: QueryTypes.INSERT})
            res.send({status: "success"});
        } catch (error) {
            if(error.code === "ER_DUP_ENTRY") {
                res.send({status: "duplicate"});
            } else{
                res.send({status: "error", error: error});
            }
        }
    }

    async get(req, res){
        try {
            let manager = await Manager.findAll();
            res.send({status: "success", managers: manager})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async delete(req, res){
        try {
            const {id} = req.body;
            db.query("delete users from users join managers on users.id = managers.userId where managers.id = ?", {replacements: [id], type : QueryTypes.DELETE})
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }
}

module.exports = new ManagerController()