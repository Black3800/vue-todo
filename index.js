const express = require('express')
const app = express()
const port = process.env.PORT
const uri = process.env.MONGODB_URI
const server = require('http').createServer(app)
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

app.get('/todos/max', function (req, res) {
    let MongoClient = require('mongodb').MongoClient
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err
        let dbo = db.db('test')
        dbo.collection('todos').find().sort({id: -1}).limit(1).toArray(function (err, result) {
            if (err) throw err
            if (result.length === 0)
            {
                res.send('[{ \"id\": 0 }]')
            }
            else
            {
                res.send(JSON.stringify(result))
            }
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
                emit('u')
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
                emit('u')
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
                emit(req.body.random.toString())
                db.close()
            }
        )
    })
})

app.use(express.static('./public'))

function emit(msg)
{
    console.log('broadcast to client from server')
    for (const c of clients)
    {
        c.sendUTF(msg)
    }
}

function originIsAllowed(origin)
{
    const regex = /^([\w]+\.)*anakint\.com$/gm
    return regex.test(origin)
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
    conn.on('close', () => {
        clients.splice(clients.indexOf(conn), 1)
    })
})

console.log('app is running at port ' + port)
let s = server.listen(port)
s.on('clientError', (err, socket) => {
    console.error(err)
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

