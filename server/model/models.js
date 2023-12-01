const sequelize = require('../config/config')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    login: {type: DataTypes.STRING, unique: true},
    password : {type: DataTypes.STRING},
    iv : {type: DataTypes.STRING}
}, {
    timestamps: false,
})

const Role = sequelize.define('role', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    role: {type: DataTypes.STRING, unique: true}
}, {
    timestamps: false,
})

const Client = sequelize.define('client', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    name: {type: DataTypes.STRING},
    surname: {type: DataTypes.STRING},
    patronymic: {type: DataTypes.STRING},
    email: {type: DataTypes.STRING},
    phone: {type: DataTypes.STRING},
    status: {type: DataTypes.STRING},
}, {
    timestamps: false,
})

const Manager = sequelize.define('manager', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    name: {type: DataTypes.STRING},
    surname: {type: DataTypes.STRING},
    phone: {type: DataTypes.STRING},
}, {
    timestamps: false,
})

const Status = sequelize.define('status', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    status: {type: DataTypes.STRING, unique: true}
}, {
    timestamps: false,
})

const Call = sequelize.define('call', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    id_client:{type: DataTypes.INTEGER},
    theme: {type: DataTypes.STRING},
    phone:{type: DataTypes.STRING}
}, {
    timestamps: false,
})

const Bid = sequelize.define('bid', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    description : {type :DataTypes.STRING},
    type : {type: DataTypes.STRING},
    msg: {type: DataTypes.STRING},
    data_start :{type :DataTypes.DATEONLY},
    data_end : {type:DataTypes.DATEONLY},
    type_user : {type: DataTypes.ENUM('Гос. учреждение', 'Физ. лицо', 'Иное юр. лицо')},
    price : {type : DataTypes.FLOAT}
}, {
    timestamps: false,
})

const Document = sequelize.define('document', {
    id:{type: DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    path : {type :DataTypes.STRING}
}, {
    timestamps: false,
})

Role.hasMany(User, { onDelete: 'cascade' })
User.belongsTo(Role)

User.hasOne(Client, { onDelete: 'cascade' })
Client.belongsTo(User)

User.hasOne(Manager, { onDelete: 'cascade' })
Manager.belongsTo(User)

Client.hasMany(Bid, { onDelete: 'cascade' })
Bid.belongsTo(Client)

Manager.hasMany(Bid, {onDelete : 'cascade'})
Bid.belongsTo(Manager)

Status.hasMany(Bid, {onDelete : 'cascade'})
Bid.belongsTo(Status)

Bid.hasOne(Document, {onDelete : "cascade"})
Document.belongsTo(Bid);

module.exports = {
    User, Role, Client, Manager, Status, Call, Bid, Document
}