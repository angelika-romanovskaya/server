const { QueryTypes } = require('sequelize');
const db = require('../config/config')
const {Call, User, Bid, Document} = require('../model/models')
const pdf = require('html-pdf')
const uuid = require('uuid')
const path = require('path');


const pdfTemplate = require('../function/document')

class DocumentController{
    async create(req, res){
        try {
            const {id} = req.body;
            let document = await Document.findAll();
            let findDoc = document.find(el => el.bidId === id)
            let bid = await db.query("select DATE_FORMAT(bids.data_start, '%Y-%m-%d') as data_start, DATE_FORMAT(bids.data_end, '%Y-%m-%d') as data_end, bids.price, bids.type_user, bids.id, managers.name as nameManager, managers.surname as surnameManager, statuses.status, clients.name, clients.surname, clients.phone, clients.email, bids.statusId, bids.type, bids.description from bids join clients on clients.id = bids.clientId join statuses on statuses.id = bids.statusId join managers on bids.managerId = managers.id where bids.id = ?", {replacements : [id], type : QueryTypes.SELECT})
            let filename = uuid.v4() + '.pdf';
            let path = `${__dirname}/../document/${filename}`
            pdf.create(pdfTemplate(bid[0]), {}).toFile(path, (err)=>{
                if(err){
                    res.send({status: "error", error: err});
                }
            })
            if(findDoc){
                await Document.update({path:path} , {where:{id:findDoc.id}})
            } else{
                await Document.create({path:path, bidId:id})
            }
            res.send({status: "success"})
        } catch (error) {
            res.send({status: "error", error: error});
        }
    }

    async get(req, res){
       try {
        const {id} = req.body;
        let document = await Document.findOne({where : {id:id}})
        console.log(path.resolve(__dirname, '..', 'document', path.basename(document.path)))
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(path.resolve(__dirname, '..', 'document', path.basename(document.path)))
       } catch (error) {
        console.log(error)
            res.send({status: "error", error: error});
       }
    }
}

module.exports = new DocumentController()