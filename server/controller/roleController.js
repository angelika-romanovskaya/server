const db = require('../config/config')
const {Role} = require('../model/models')
class RoleController{
    async add(req,res){
        await Role.create({role: "ADMIN"})
        await Role.create({role: "MANAGER"})
        await Role.create({role: "CLIENT"})
    }
}

module.exports = new RoleController()