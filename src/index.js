const express = require('express')
require('./db/mongoose')
const userRouter = require('./Routers/user')
const taskRouter = require('./Routers/task')

const app = express()
const port = process.env.PORT


const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        // cb(new Error('File must be PDF'))
        // cb(undefined, true)
        // cb(undefined, false)

        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('File must be word'))
        }

        cb(undefined, true)
    }
})


app.post('/upload', upload.single('upload'), (req, res)=>{
    res.send()
}, (err, req, res, next) =>{
    res.status(400).send({error: err.message})
})

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port, ()=>{
    console.log('Open on port ' + port)
})