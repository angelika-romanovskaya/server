module.exports = ({data_start, data_end,price,type_user,nameManager,surnameManager,name, surname,phone,email,type, description})=>{
    return `<html>
    <head>
        <meta charset = "utf-8">
        <title>Document PDF</title>
        <style>
        </style>
    </head>
    <body>
        <h1>${name} ${surname}</h1>
        <h3>${data_start} - ${data_end}</h3>
        <h3>${type}</h3>
        <h3>${description}</h3>
    </body>
    </html>`
}