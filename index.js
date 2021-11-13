const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId

const cors = require('cors')
require('dotenv').config()
const app = express();




const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kvbsf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('shampoo_pro');
        const productsCollection = database.collection('products')
        const servicesCollection = database.collection('services')
        const orderCollection = database.collection('orders')
        const usersCollection = database.collection('users')
        const reviewCollection = database.collection('review')
        // get Api
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })
        // post product 
        app.post('/products', async (req, res) => {
            const product = req.body
            console.log('hit the post', product)
            const result = await productsCollection.insertOne(product)
            console.log(result)
            res.json(result)
        })
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query)
            res.json(product)
        })
        app.delete('/dltProducts/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            console.log(result)
            res.json(result)
        })
        // service Get Api
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({})
            const services = await cursor.toArray()
            res.send(services)
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await servicesCollection.findOne(query)
            res.json(service)
        })
        // post
        app.post('/services', async (req, res) => {
            const service = req.body
            console.log('hit', service)
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result)
        })

        app.get('/orders', async (req, res) => {
            const email = req.query.email
            let query = {}
            if (email) {
                query = { email: email }
            }
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)
        })
        app.post('/orders', async (req, res) => {
            const order = req.body
            // console.log('jkjk', order)
            order.createdAt = new Date()
            const result = await orderCollection.insertOne(order)
            console.log(result)
            res.json(result)
        })
        app.delete('/dltOrders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            console.log(result)
            res.json(result)
        })
        // allOrder(manage orders)
        app.get("/allOrders", async (req, res) => {
            // console.log("hello");
            const result = await orderCollection.find({}).toArray();
            res.send(result);
        });
        app.delete('/dltOrders/:orderId', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            console.log(result)
            res.json(result)
        })

        // status update
        app.put("/statusUpdate/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            console.log(req.params.id);
            const result = await orderCollection.updateOne(filter, {
                $set: {
                    status: req.body.status,
                },
            });
            res.send(result);
            console.log(result);

        });
        // users
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })





        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            console.log(result)
            res.json(result)
        })
        app.put('/users', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }

            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)

        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', req.headers.authorization)
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })


        // review

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({})
            const reviews = await cursor.toArray()
            res.send(reviews)
        })
        app.post('/review', async (req, res) => {
            const review = req.body
            console.log('hit the post', review)
            const result = await reviewCollection.insertOne(review)
            console.log(result)
            res.json(result)
        })

    }



    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World')
})
app.listen(port, () => {
    console.log('listening to port', port)
})