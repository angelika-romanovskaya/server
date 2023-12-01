const { QueryTypes } = require('sequelize');
const db = require('../config/config')
const {Call, User, Bid} = require('../model/models')
const {encrypt, decrypt} = require('../function/Encryption')

class StatisticController{
    async summaryBid(req,res){
        try {
            let manager = [];
            let result = await db.query("select bids.managerId, managers.name, managers.surname, managers.phone, SUM(bids.price) as sum from bids  join managers on bids.managerId  = managers.id where not bids.statusId = 13 group by bids.managerId", {type:QueryTypes.SELECT})
            manager = [...result]
            let client = [];
            let results = await db.query("select bids.clientId, clients.name, clients.surname, clients.phone, clients.email, SUM(bids.price) as sum from bids  join clients on bids.clientId = clients.id where not bids.statusId = 13 group by bids.clientId", {type:QueryTypes.SELECT})
            client = [...results]
            res.send({status: "success", manager: manager, client: client})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async sumPrice(req, res){
        try {
            let sum = await db.query("select SUM(bids.price) as sum from bids", {type:QueryTypes.SELECT})
            res.send({status: "success", sum: sum[0]})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async getChartManagerAdmin(req, res){
        try {
            let manager = [];
            let bid = [];
            let result = await db.query("select concat(managers.name, ' ', managers.surname) as fullname, count(*) as count from managers join bids on bids.managerId = managers.id where not bids.statusId = 13 group by managers.id", {type :QueryTypes.SELECT})
            result.forEach(el => {manager.push(el.fullname); bid.push(el.count)})
            res.send({status: "success", manager: manager, bid: bid})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }
    
    async getChartClientAdmin(req, res){
        try {
            let client = [];
            let bid = [];
            let result = await db.query("select bids.type_user as user, count(*) as count from bids group by bids.type_user", {type: QueryTypes.SELECT})
            result.forEach(el => {client.push(el.user); bid.push(el.count)})
            res.send({status: "success", client: client, bid: bid})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }
    
    async getReport(req, res){
        try {
            let {start, end} = req.body;
            let bid = [];
            let sumBid = 0;
            let bidStatus = [];
            let count = await db.query("select count(*) as count from bids where bids.data_start between ? and ?", {replacements: [start, end], type:QueryTypes.SELECT})
            sumBid = count[0].count;
            let status = await db.query("select count(*) as count, status from bids join statuses on bids.statusId = statuses.id where bids.data_start between ? and ? group by bids.statusId", {replacements: [start, end], type : QueryTypes.SELECT})
            bidStatus = [...status]
            let result = await db.query("select concat(managers.name, ' ', managers.surname) as fullname, type_user, sum(price) as price, count(*) as count from bids join managers on bids.managerId= managers.id where bids.data_start between ? and ? group by bids.managerId, bids.type_user", {replacements: [start, end], type : QueryTypes.SELECT})
            bid = [...result]
            console.log(sumBid, bid, bidStatus)
            res.send({status: "success", sumBid : sumBid, bid : bid, bidStatus:bidStatus})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }
    
    async topManagers(req, res){
        try {
            const {dateStart, dateEnd} = req.body;
            let result = await db.query("select concat(managers.name, ' ', managers.surname) as fullname, count(*) as count, sum(price) as price from bids join managers on bids.managerId = managers.id where bids.statusId = 14 group by bids.managerId", {replacements : [dateStart, dateEnd], type : QueryTypes.SELECT})
            result.sort((a,b)=>b.price - a.price);
            result.length = result.length > 3 ?  3 : result.length;
            console.log(result)
            res.send({status: "success", manager : result})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }
}

module.exports = new StatisticController()