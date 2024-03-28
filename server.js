const express = require('express')
const app = express()
const path = require('path')

app.use(express.json())

// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: '3882e6ad8e7941c1957fb73010d7d334',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    rollbar.info('Someone retrieved students.')
    res.status(200).send(students)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
        rollbar.info('A new student was added')
           students.push(name)
           res.status(200).send(students)
       } else if (name === ''){
        rollbar.warning('Someone did not enter a name')
           res.status(400).send('You must enter a name.')
       } else {
        rollbar.error('The student someone tried to add already exists')
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
    rollbar.critical('There was a major error trying to remove a student')
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    rollbar.info('A student was removed!' )
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
