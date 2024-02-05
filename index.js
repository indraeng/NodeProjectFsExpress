const express = require('express')
// const users = require('./MOCK_DATA.json')
const fs = require('fs')
const mongoose = require('mongoose')

const app = express()

//connection
mongoose.connect('mongodb://127.0.0.1:27017/youtube-app-1')          //database name = youtube-app-1
    .then(() => console.log('MongoDB connected successfully...'))
    .catch((err) => console.log('MongoDB error', err))

//shema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String
    },
    jobTitle: {
        type: String
    }
},
    { timestamps: true }
)

//model

const User = mongoose.model('user', userSchema)

//middleware
app.use(express.urlencoded({ extended: false }))
app.use((req, resp, next) => {
    console.log('Hello from middleware 1')
    fs.appendFile('log.txt', `\n${Date.now()} : ${req.ip} : ${req.method} : ${req.path}`, (err, data) => {
        next()
    })
})


//get all users as html
app.get('/users', async (req, resp) => {
    const allDbUsers = await User.find({});
    const html = `
        <ol>
            ${allDbUsers.map((user) => `<li>${user.firstName} - ${user.email}</li>`).join('')}
        </ol>`
    resp.send(html)
})

//get all users
app.get('/api/users', async (req, resp) => {
    const allDbUsers = await User.find({})
    // resp.setHeader('X-UserName', 'Indrajit Naskar')    //custom header
    // console.log(req.headers);
    resp.json(allDbUsers)
})

//get perticular single user
app.get('/api/users/:id', async (req, resp) => {
    // const id = req.params.id
    // const user = users.find(
    //     (usr) => usr.id == id
    // )
    const user = await User.findById(req.params.id)

    if (!user) {
        resp.status(404).json({ error: 'No user found' })
    }
    resp.json(user)
})

//patch request
app.patch('/api/users/:id', async (req, resp) => {
    await User.findByIdAndUpdate(req.params.id, { lastName: 'Chnaged' })
    resp.json({ status: 'sucess' })
})

//delete request
app.delete('/api/users/:id', async (req, resp) => {
    await User.findByIdAndDelete(req.params.id)
    resp.json({ status: 'success' })
})

//post request

app.post('/api/users', async (req, resp) => {
    const body = req.body;
    if (!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title) {
        resp.status(400).json({ msg: 'All fields are required...' })
    }
    // console.log(body);

    // users.push({ ...body, id: users.length + 1 })
    // fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
    //     return resp.status(201).json({ status: 'success', id: users.length })
    // })

    const result = await User.create({
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        gender: body.gender,
        jobTitle: body.job_title
    })
    console.log('result', result);
    resp.status(201).json({ msg: 'success' })
})


app.listen(8000, () => console.log('New server started successfully...'))