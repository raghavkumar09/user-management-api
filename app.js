import express from 'express';
import dbConnection from './db/connection.js'
const app = express()
const PORT = process.env.PORT || 3000; 

dbConnection()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

import router from './routes/user.route.js';
app.use('/api/user', router)

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})