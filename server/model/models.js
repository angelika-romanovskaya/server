const sequelize = require('../config/config')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    login: {type: DataTypes.STRING, unique: true},
    password : {type: DataTypes.STRING},
    iv : {type: DataTypes.STRING}
})

const Role = sequelize.define('role', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    role: {type: DataTypes.STRING, unique: true}
})

Role.hasOne(User)
User.belongsTo(Role)

module.exports = {
    User, Role
}