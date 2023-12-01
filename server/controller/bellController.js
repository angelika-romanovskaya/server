const { QueryTypes } = require('sequelize');
const db = require('../config/config')
const {Call, User} = require('../model/models')
const {encrypt, decrypt} = require('../function/Encryption')

class BellController{
    async add(req, res){
        try {
            const {password, login, theme, phone} = req.body;
            if(password === '' && login === ''){
                await Call.create({theme: theme, phone : phone})
                res.send({status: "success"});
            } else{
                let users = await User.findAll();
                let user =  users.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
                if(user.length !== 0){
                    await db.query("insert into calls(id_client, theme) value((select id from clients where userId = ?),?)", {replacements: [user[0].id, theme], type:QueryTypes.INSERT})
                    res.send({status: "success"});
                }
            }
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async get(req, res){
        try {
            let calls = await db.query("select id, theme, 'anonymous' as name, phone as phone from calls where id_client is null union select calls.id, calls.theme, concat(clients.name, ' ', clients.surname) as name, clients.phone as phone from calls join clients on calls.id_client = clients.id where calls.id_client is not null", {type : QueryTypes.SELECT})
            res.send({status: "success", calls: calls})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async delete(req, res){
        try {
            const {id} = req.body;
            Call.destroy({where : {id:id}})
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }
}

module.exports = new BellController()