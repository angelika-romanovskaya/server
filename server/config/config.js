const mysql = require('mysql2')
const {Sequelize} = require('sequelize')

module.exports = new  Sequelize(
    'filesmanagers',
    'root',
    'QWE123123',
    {
        dialect : 'mysql',
        host : 'localhost'
    }
);