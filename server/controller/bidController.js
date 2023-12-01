const { QueryTypes } = require('sequelize');
const db = require('../config/config')
const {Call, User, Bid} = require('../model/models')
const {encrypt, decrypt} = require('../function/Encryption')

class BidController{
    async add(req, res){
        try {
            const {id, type, description, typeUser, dataStart} = req.body;
            console.log(typeUser)
            let id_manager;
            let count = await db.query("select users.id as id_manager, COUNT(*) as 'количество заявок в обработке' from users left outer join bids on users.id = bids.managerId where users.roleId = 2 group by users.id order by COUNT(*)", {type: QueryTypes.SELECT})
            if(count.length !== 0){
                id_manager = count[0].id_manager;
            }
            let users = await User.findAll({id:id, roleId:2})
            let user =  users.filter(elem => elem.id === id);
            let manager = users.filter(elem=>elem.roleId === 2);
            if(id_manager === undefined){
                id_manager = manager[0].id;
            }
            await db.query('call addBid(?,?,?,?,?,?)', {replacements: [user[0].id, type, description, id_manager, typeUser, dataStart], type : QueryTypes.INSERT})
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async get(req, res){
        try {
            const {id, role} = req.body;
            if(role.role === "CLIENT"){
                let bid = await db.query("select DATE_FORMAT(bids.data_start, '%Y-%m-%d') as data_start, DATE_FORMAT(bids.data_end, '%Y-%m-%d') as data_end, bids.id, bids.price, statuses.status, bids.msg, managers.name, managers.surname, bids.statusId, bids.type, bids.description, documents.id as document from bids join managers on bids.managerId = managers.id join statuses on statuses.id = bids.statusId join clients on clients.id = bids.clientId left join documents on bids.id = documents.bidId where clients.userId = ?", {replacements: [id], type:QueryTypes.SELECT})
                res.send({status: "success", bid: bid})
            } else if(role.role === "MANAGER"){
                let bid = await db.query("select DATE_FORMAT(bids.data_start, '%Y-%m-%d') as data_start, DATE_FORMAT(bids.data_end, '%Y-%m-%d') as data_end, bids.price, bids.type_user, bids.id, documents.id as document, statuses.status, clients.name, clients.surname, clients.phone, clients.email, bids.statusId, bids.type, bids.description from bids join clients on bids.clientId = clients.id join statuses on statuses.id = bids.statusId join managers on bids.managerId = managers.id left join documents on bids.id = documents.bidId join users on managers.userId = users.id where managers.userId = ? and not bids.statusId = 13", {replacements: [id], type:QueryTypes.SELECT})
                res.send({status: "success", bid: bid})
            } else{
                let bid = await db.query("select DATE_FORMAT(bids.data_start, '%Y-%m-%d') as data_start, DATE_FORMAT(bids.data_end, '%Y-%m-%d') as data_end, bids.price, bids.type_user, bids.id, documents.id as document,  managers.name as nameManager, managers.surname as surnameManager, statuses.status, clients.name, clients.surname, clients.phone, clients.email, bids.statusId, bids.type, bids.description from bids join clients on clients.id = bids.clientId left join documents on bids.id = documents.bidId join statuses on statuses.id = bids.statusId join managers on bids.managerId = managers.id where bids.statusId = 12", {type : QueryTypes.SELECT})
                res.send({status: "success", bid: bid})
            }
        } catch (error){
            console.log(error)
            res.send({status: "error", error: error});
        }
    }

    async viewed(req, res){
        try {
            const {id} = req.body;
            await Bid.update({statusId:11}, {where : {statusId:10, id:id}})
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async deleted(req, res){
        try {
            const {id} = req.body;
            await Bid.destroy({where: {id:id}})
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async approve(req, res){
        try {
            const {id, msg, role, data_end, price} = req.body;
            if(role.role === "MANAGER"){
                await Bid.update({price: price, msg:msg, data_end:data_end, statusId:12}, {where : {id:id}})
                res.send({status: "success"})
            } else{
                await Bid.update({msg:msg,statusId:14}, {where : {id:id}})
                res.send({status: "success"})
            }
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async reject(req, res){
        try {
            const {id,msg} = req.body;
            Bid.update({statusId:13, msg:msg}, {where:{id:id}})
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }
}

module.exports = new BidController()