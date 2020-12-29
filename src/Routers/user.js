const express = require('express')
const User = require('../models/user')
const auth = require('../middlewear/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendLeavingEmail} = require('../emails/account')

const router = new express.Router()
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("File has wrong extension"), false)
        }

        cb(undefined, true)
    }
})

router.post('/users', async (req, res)=>{
    const user = new User(req.body)

    try{
        await user.save()
        //async, but no return value
        sendWelcomeEmail(user.email, user.name)
        console.log('sent')
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        req.user.tokens = []

        await req.user.save()

        res.send()
    } catch(e){
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res)=>{
    res.send(req.user)
})



router.patch('/users/me', auth, async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((property)=>{
        return allowedUpdates.includes(property)
    })

    if(!isValidOperation){
        return res.status(400).send('Invalid updates')
    }


    try{
        updates.forEach((update)=>{

            req.user[update] = req.body[update]
        })

        await req.user.save()

        res.send(req.user)
    } catch(e){
        res.status(400).send()
    }
})


router.delete('/users/me', auth, async (req, res)=>{

    try{
        await req.user.remove()
        sendLeavingEmail(req.user.email, req.user.name)

        res.send(req.user)

    } catch(e){
        res.status(500).send()
    }
})



router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    
    const buffer = await sharp(req.file.buffer).resize({width: 250, height:250 }).png().toBuffer()

    req.user.avatar = buffer

    await req.user.save()

    res.send()
}, (err, req, res, next) =>{
    res.status(400).send({error: err.message})
})


router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined
    await req.user.save()

    res.send()
}, (err, req, res, neext)=>{
    res.status(400).send(err.message)
})


router.get('/users/:id/avatar', async (req, res) =>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e){
        res.status(404).send()
    }
})

module.exports =  router