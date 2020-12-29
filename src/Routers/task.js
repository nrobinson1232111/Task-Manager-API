const express = require('express')
const Task = require('../models/task')
const auth = require('../middlewear/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res)=>{

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        const saved = await task.save();
        res.status(201).send(saved)
    } catch(e){
        res.status(400).send(e)
    }
})

//Get /tasks?completed=true||false
router.get('/tasks', auth, async (req, res)=>{

    const match = {}
    const sort ={}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split("_")
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    try{
        const user = await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }
    catch(e){
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async(req, res)=>{

    const _id = req.params.id

    try{
        const task = await Task.findOne({
            _id,
            owner: req.user._id 
        })

        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch(e){
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async(req, res) =>{
    const properties = Object.keys(req.body)
    const allowedProperties = ['description', 'completed']

    const isAllowed = properties.every((prop)=>{
        return allowedProperties.includes(prop)
    })

    if(!isAllowed){
        return res.status(400).send()
    }

    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        properties.forEach((property)=>{
            task[property] = req.body[property]
        })
        await task.save()

        res.status(200).send(task)
    } catch(e){
        res.status(500).send()
    }

})


router.delete('/tasks/:id', auth, async (req, res)=>{

    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if(!task){
            return res.status(404).send()   
        }

        res.send(task)
    } catch(e){
        res.status(500).send()
    }
})

module.exports = router