const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/todos', function (req, res) {
    let MongoClient = require('mongodb').MongoClient
    MongoClient.connect('mongodb://52.163.89.103:27017/test', function (err, db) {
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
    MongoClient.connect('mongodb://52.163.89.103:27017/test', function (err, db) {
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
    MongoClient.connect('mongodb://52.163.89.103:27017/test', function (err, db) {
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
    MongoClient.connect('mongodb://52.163.89.103:27017/test', function (err, db) {
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

console.log('app is running at port ' + port)
app.listen(port)