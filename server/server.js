const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const SALT_I = 10
const jwt = require('jsonwebtoken')
const cors = require('cors')

const  { User } = require('./models/models')

const port = process.env.PORT || 3001

require('dotenv').config()

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true },(err) => {
    if(err) return err
    console.log("Conectado a MongoDB")
})

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

app.post('/register', (req, res) => {
    const user = new User(req.body)
    user.save((err, doc) => {
        if(err) return res. json({success: false, err})
        res.status(200).json({
            success: true,
            userdata: doc
        })
    })
})

app.post('/login', (req,res) => {
    User.findOne({
        'email': req.body.email
    }, (err, user) => {
        if(!user) return res.json({
            loginSuccess: false,
            message: 'Datos incorrectos'
        })
        user.comparePassword(req.body.password, (err,isMatch) => {
            if(!isMatch) return res.json({
                loginSuccess: false,
                message: 'Datos incorrectos'
            })
            user.generateToken((err,user) => {
                if (err) return res.status(400).send(err)
                res.cookie('loginBedu',user.token).status(200).json({
                    loginSuccess:true,
                    message: 'Correcto'+"<br/>usuario"+user.name+"Apellido"+user.lastname+"token",
                    role: user.role
                })
            })
        })
        
    })
})

app.get('/profile', (req, res) => {
    let token = req.cookies.loginBedu    
    User.findByToken(token,(err,user) => {
        if(err) throw err
        if(!user){
            return res.json({
                error:true 
            })
        }else {
            if(user.role == 0){
                return res.json({
                    success:true ,
                    message: "no es admin"
                })
            }else if(user.role == 1){
                return res.json({
                    success: true,
                    message: "es Admin"
                })
            }
        } 
        
    })
})

app.get('/users', async (req,res) => {
    User.find({}, (err,users) => {
        if(err) return res.status(400).send(err)
        res.status(200).send(users)
    })
})



app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`)
})