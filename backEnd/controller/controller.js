const registerschema = require("../schema/registerschema")
const postschema = require("../schema/postschema")
const networkschema = require("../schema/network")
const messageschema = require("../schema/message")
const jwtservice = require('../jwt/jwt')
const encdic = require('../encdec/encript-decript')
const mailservice = require('../emailservice/emailservice')
const fs = require('fs')
const path = require('path')

function home(req,res,next) {
    res.status(200).send("home")
}

async function networkdata(req,res,next) {
    const data = await networkschema.find()
    res.status(200).send(data)
    // console.log(data)
}
async function message(req,res,next) {
    const data = await messageschema.find()
    res.status(200).send(data)
    // console.log(data)
}

const register = async (req,res) => {
    const body = req.body
    const encpass = encdic.encryptpass(body.password)
    body.password = encpass
    const response = await registerschema.insertMany([body])
    response[0].password = ""
    res.status(201).send(response)
    sendmail(response[0])
}

async function sendmail(data) {
    // console.log(data)
    // console.log(data.email)
    // console.log(data.name)
    const info = await mailservice.sendMail({
        from: '"Sarvar 👻" <sarvar@example.com>',
        to: `${data.email}`,
        subject: `Welcome to LinkedIn ${data.name}`,
        text: `Hi ${data.name} please confirm your email address`,
        html: `<b>You are successfully registered</b>`,
    });
}

async function login(req,res,next) {
    const email = req.body.email
    const response = await registerschema.findOne({ "email": email })
    // console.log(response)
    if(!response) {
        res.status(501).send("Invalid Mail")
        return;
    }
    const isvalidpass = encdic.dcryptpass(req.body.password, response.password)
    if(isvalidpass) {
        let userdetails = {
            email: response.email,
            password: "",
        }
        const token = jwtservice.generateToken(userdetails);
        // console.log(token)
        res.status(200).send([{"token" : token, "userdata" : response}]);
        // console.log('gg', [{"token" : token, "userdata" : response}])
    } else {
        console.log("Something is wrong")
        res.status(400).send("Data not matched")
    }
}

async function saveimg(req, res, next) {
    // console.log(req.body)
    // res.send(req.file.filename)
    // var obj = {
    //     name: req.file.filename,
    //     desc: req.file.filename,
    //     img: req.file.filename
        // img: {
        //     data: fs.readFileSync(path.join(__dirname, '..','images', req.file.filename)),
        //     contentType: 'image/png'
        // }
    // }

    const data = await postschema.insertMany([req.body])
    res.send(data)
    
    // console.log( path.join(__dirname,'..',"images", req.file.filename))
    // postschema.create(obj, (err, item) => {
    //     if (err) {
    //         console.log(err);
    //     }
    //     else {
    //         res.send(obj)
    //     }
    // });
};

module.exports = {
    home,
    register,
    login,
    saveimg,
    networkdata,
    message
}