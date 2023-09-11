
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./SharedModules/DB');
const parseJsonRequest = express.json();
const multer = require('multer');
const path = require('path');
var nodemailer = require('nodemailer');
const fs = require('fs');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({storage: storage});


const attachmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'attachments/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const attachmentUpload = multer({storage: attachmentStorage});



app.use(cors());
app.use(express.static(__dirname+'/uploads'));


app.get('/',(req, res)=>{

    console.log("hello get");

    res.json({status:"hello testing"})
})

app.post('/postProductData', upload.single('image'), postProductData);

app.post('/updateProductData', upload.single('image'), updateProductData);

app.get('/getProductsData', getProductsData);

app.get('/contactAdmin',contactAdmin);

app.post('/postEnquiry', attachmentUpload.single('image'), postEnquiry);

app.post('/deleteProduct',express.json() , deleteProduct);

app.post('/getProductDataById',express.json() , getProductDataById);


app.listen('5000',()=>{
    console.log("App listening on the port 5000");
})


async function postProductData(req,res){

    try{


        const options = {
            table:'products',
            values:{
                name: req.body.product_name,
                category: req.body.category,
                image: req.file.filename
            }
        }

        const result =  await db.create(options);

        if(result.affectedRows == 1){

            res.json({status:"success", message: "Successfully got message", payload: result});
        }
        else{
            res.json({status:"failed", message: "Could not post data due to an error in the server, Database error"});
        }



    }
    catch(error){

        res.json({status:"failed", message: "Could not post data due to an error in the server, Server error"});

    }

    
}

async function getProductsData(req,res){

    try{

        const options = {
            tableName: 'products',
            columnNames: ['id','name']
        }

        var rowOffset = 0;

        if(req.query.page){

            rowOffset = (parseInt(req.query.page) -1)*5;
        }

        const paginationOptions = {
            tableName:'products',
            columnNames:['id', 'name'],
            offset: rowOffset,
            limit:5
        };
 
        const paginationData =  await db.paginate(paginationOptions);
        const totalRowCount = await db.getCount(options);
    
    
        if(paginationData.length > 0){

            res.json({status:"success", message: "Successfully got message", payload:{data: paginationData, count: totalRowCount }});
        }
        else{

            res.json({status:"failed", message: "Failed to fetch data from the server."});
        }



    }
    catch(error){

        res.json({status:"failed", message: "Failed to fetch data from the server. Due to server error."});

    }




}

async function contactAdmin(req, res){


    try{


        // const isEmailSent = await sendOtpEmail();

        res.json({status:"success" });

    }
    catch(error){

        res.json({status:"failed"});
    }


}

async function sendEmail({name, email, description, attachmentPath}){

    return new Promise((resolve, reject)=>{

        try{

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'novasoft8086@gmail.com', // Your Gmail email address
                    pass: 'ijktjghmcoqvcozd'   // Your Gmail password or app-specific password
                }
            });


    
            var mailOptions = {
                from: 'testsender@gmail.com',
                to: 'ajaygg7@gmail.com',
                subject: 'Customer enquiry',
                // text: `you just got a enquiry from ${name}, email: ${email}, message: ${description} `,
                html: `<p><b>Hello Nitin,  you got a new enquiry from </b></p> <p><b>Name: </b> ${name}</p> <p><b>Email: </b> ${email}</p>  <p><b>Message: </b> ${description}</p>`,
                attachments:[
                    {
                        filename: 'sampleFile.png',
                        path: attachmentPath
                    }
                ]
                
            };
    
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
              
    
        }
        catch(error){
            resolve(false);
        }

    })

}

async function postEnquiry(req, res){


    try{

        const emailOptions = {
            name: req.body.name,
            email: req.body.email,
            description: req.body.description,
            attachmentPath: `attachments/${req.file.filename}`
        }

        const isEmailSent = await sendEmail(emailOptions);

        if(isEmailSent){

            const filePathToDelete = `${__dirname}/attachments/${req.file.filename}`;
            const result = await deleteFile(filePathToDelete);


            res.json({status:"success", message:"Successfully sent message"});
        }
        else{

            res.json({status:"failed", message: "Failed to send enquiry. Please try again later"});
        }



    }
    catch(error){

        res.json({status:"failed", message: "Failed to send enquiry. Please try again later"});
    }


}

async function deleteProduct(req, res){



    try{

        if(req.body.product_id){


            const productId = req.body.product_id;

            const readOptions = {
                tableName: 'products', 
                columnNames: ['id','image'], 
                condition: `id = ${productId}`
            };
        
            const readResponse = await db.readWhere(readOptions);
        
            if(readResponse.length > 0){
                
                const filePathToDelete = `${__dirname}/uploads/${readResponse[0].image}`;
                const result = await deleteFile(filePathToDelete);
            }

            const options = {
                tableName: 'products', 
                condition: `id = ${req.body.product_id}`
            }

            const result = await db.deleteRow(options);

            if(result.affectedRows == 1){

                res.json({status:"success", message:"successfully deleted the item", payload: productId });
            }
            else{

                res.json({status:"failed", message: "failed to delete the item from the database" });
            }

    
        }
        else{

            res.json({status:"failed", message: "failed to delete the item from the database, due to an error in the server." });
        }

    }
    catch(error){

        res.json({status:"failed" });

    }



}

async function getProductDataById(req, res){

    try{

        const options = {
            tableName: 'products', 
            columnNames: ['id','name','category'], 
            condition: `id = ${req.body.product_id}`
        }
    
        const result = await db.readWhere(options);
    
        if(result.length > 0){
    
            res.json({status: "success", message: 'successfully got data from the server', payload: result[0] });
        }
        else{
            res.json({status: "failed", message: 'Could not fetch data from the server'});
        }


    }
    catch(error){
        
        res.json({status: "failed", message: 'Could not fetch data from the server, due to an error.'});
    }



}

async function updateProductData(req, res){

    try{

        if(req.file){



            const readOptions = {
                tableName: 'products', 
                columnNames: ['id','image'], 
                condition: `id = ${req.body.product_id}`
            };
    
            const readResponse = await db.readWhere(readOptions);

            if(readResponse.length > 0){
                
                const filePathToDelete = `${__dirname}/uploads/${readResponse[0].image}`;
                const result = await deleteFile(filePathToDelete);
            }

            const updateOptions = {
                tableName: 'products', 
                columns:['name', 'category', 'image'], 
                values:[req.body.product_name, req.body.product_category, req.file.filename],
                condition: `id = ${req.body.product_id}`
            }

            const updateResponse = await db.update(updateOptions);

            if(updateResponse.affectedRows == 1){

                res.json({status: "success", payload: updateResponse});
            }
            else{
                res.json({status: "failed", message: 'Could not fetch data from the server, due to an error in the database.', payload: error});
            }

        }
        else{

            const options = {
                tableName: 'products', 
                columns:['name', 'category'], 
                values:[req.body.product_name, req.body.product_category],
                condition: `id = ${req.body.product_id}`
            }
    
            const updateResponse = await db.update(options);

            if(updateResponse.affectedRows == 1){

                res.json({status: "success", payload: updateResponse});
            }
            else{
                res.json({status: "failed", message: 'Could not fetch data from the server, due to an error in the database.', payload: error});
            }

        }

    }
    catch(error){

        console.log("error");
        console.log(error);

        res.json({status: "failed", message: 'Could not fetch data from the server, due to an error in the server.', payload: error});
    }

}


function deleteFile(filePath) {

    return new Promise((resolve, reject) => {

      fs.unlink(filePath, (err) => {

        if (err) {

          reject(err);
        } else {

          resolve(`File ${filePath} deleted successfully.`);
        }
      });
    });
}









