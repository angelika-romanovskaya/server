const db = require('../config/config')
const {Status} = require('../model/models')
class StatusController{
    async add(req,res){
        await Status.create({status: "отправлена"})
        await Status.create({status: "просмотрена"})
        await Status.create({status: "на утверждении"})
        await Status.create({status: "отказ"})
        await Status.create({status: "утверждена"})
    }
}

module.exports = new StatusController()