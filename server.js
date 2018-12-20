var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

var dburl = 'mongodb://testuser1:testuser1@ds139614.mlab.com:39614/chatbox'
var Message = mongoose.model('Message',{
    name: String,
    message: String
})



app.get('/messages', (req, res) =>{
    Message.find({}, (err,messages)=>{
        res.send(messages)
    })
 
})

app.get('/messages/:user', (req, res) => {
    var user = req.params.user
    Message.find({name: user}, (err, messages) => {
        res.send(messages)
    })
})

app.post('/messages', async (req, res) => {

    try {
        //throw 'some error'
        var message = new Message(req.body)

        var savedMessage = await message.save()

        console.log('saved')

        var censored = await Message.findOne({ message: 'badword' })

        if (censored)
            await Message.remove({ _id: censored.id })
        else
            io.emit('message', req.body)

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally{
        //Logger.log ('message post called')
    }
})

io.on('connection', (socket) => {
    console.log('a user connected')
})
mongoose.connect(dburl, {useNewUrlParser: true}, (err)=>{
    console.log('mongo db connection',err)
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})