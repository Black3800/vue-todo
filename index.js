const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const uri = process.env.MONGODB_URI || 'mongodb://52.163.89.103:27017/test'
const server = require('https').createServer(app)
const WebSocketServer = require('websocket').server
const ws = new WebSocketServer({ httpServer: server })

app.use(express.json())

app.get('/todos', function (req, res) {
    let MongoClient = require('mongodb').MongoClient
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err
        let dbo = db.db('test')
        dbo.collection('todos').find().sort({completed: 1, id: -1}).toArray(function (err, result) {
            if (err) throw err
            res.send(JSON.stringify(result))
            db.close()
        })
    })
})

app.post('/todos/:id', function (req, res) {
    let MongoClient = require('mongodb').MongoClient
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err
        let dbo = db.db('test')
        dbo.collection('todos').updateOne(
            { id: parseInt(req.params.id) },
            {
                $set: {
                    completed: req.body.completed
                }
            },
            function (err, result) {
                if (err) throw err
                console.log("updated todo" + req.params.id)
                res.send(JSON.stringify(result))
                db.close()
            }
        )
    })
})

app.delete('/todos/:id', function (req, res) {
    let MongoClient = require('mongodb').MongoClient
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err
        let dbo = db.db('test')
        dbo.collection('todos').deleteOne(
            {id: parseInt(req.params.id)},
            function (err, result) {
                if (err) throw err
                console.log("deleted todo" + req.params.id)
                res.send(JSON.stringify(result))
                db.close()
            }
        )
    })
})

app.put('/todos/:id', function (req, res) {
    let MongoClient = require('mongodb').MongoClient
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err
        let dbo = db.db('test')
        dbo.collection('todos').insertOne(
            {
                id: parseInt(req.params.id),
                text: req.body.text,
                completed: req.body.completed
            },
            function (err, result) {
                if (err) throw err
                console.log("inserted todo" + req.params.id)
                res.send(JSON.stringify(result))
                db.close()
            }
        )
    })
})

app.use(express.static('./public'))

function originIsAllowed(origin) {
    return origin.indexOf('anakint.com') !== -1
}

let clients = []

ws.on('request', function (request) {
    console.log('new client connect to ws')
    if (!originIsAllowed(request.origin))
    {
        console.log('Forbidden origin ' + request.origin + ' tried to connect to ws')
        return
    }
    let conn = request.accept(null, request.origin)
    clients.push(conn)
    
    conn.on('message', (msg) => {
        console.log('broadcasting update to clients')
        for (const c of clients)
        {
            c.sendUTF('u')
        }
    })
})

console.log('app is running at port ' + port)
server.listen(port)

