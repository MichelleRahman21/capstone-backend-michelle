const express = require('express')

const app = express()
//  stands for request(from the client) and respond(back to the client)
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(4741, () => console.log('Example app listening on port 4741!'))
