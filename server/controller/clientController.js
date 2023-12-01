const { QueryTypes } = require('sequelize');
const db = require('../config/config')
const {Client, User} = require('../model/models')
const {encrypt, decrypt} = require('../function/Encryption')

class ClientController{
    async get(req, res){
        try {
            let client = await db.query("select clients.id, clients.name, clients.surname, clients.patronymic, clients.email, clients.phone, clients.status, users.login from clients join users where clients.userId = users.id", {type: QueryTypes.SELECT})
            res.send({status: "success", clients: client})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async blocked(req, res){
        try {
            const {id} = req.body;
            await Client.update({status:'blocked'}, {where : {id : id}})
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async unblocked(req, res){
        try {
            const {id} = req.body;
            await Client.update({status:'active'}, {where : {id : id}})
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }


    async delete(req, res){
        try {
            const {id} = req.body;
            await Client.update({status:'deleted'}, {where : {userId : id}})
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async restore(req, res){
        try {
            const {password, login} = req.body;
            let users = await User.findAll();
            let user =  users.filter(elem=>decrypt({password: elem.password, iv: elem.iv}) === password && elem.login === login);
            if(user.length !== 0){
                await Client.update({status : 'active'}, {where : {userId : user[0].id}})
                res.send({status: "success", role: "CLIENT", id: user[0].id})
            } else{
                res.send({status: "not found"})
            }
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }
}

module.exports = new ClientController()