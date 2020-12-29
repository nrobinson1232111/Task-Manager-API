const mongoose = require('mongoose')

// function closeMongoose(db){
//     db.connection.close().then(res=>{
//         console.log('closed')
//     }).catch(err=>{
//         console.error(err)
//         console.error('error closing')
//     })
// }

mongoose.connect(process.env.MONGODB_URL,
{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}
)

module.exports = mongoose