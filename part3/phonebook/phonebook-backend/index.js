const express = require('express')
const app = express()
var morgan = require('morgan')

app.use(express.json())

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

function randInt(max) {
  return Math.floor(Math.random() * max) + 1
}

app.get('/info', (request, response) => {
  const requestTime = Date()
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${requestTime}</p>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if (person)
    response.json(person)
  else
    response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  console.log('id', id);
  console.log('persons before', persons)
  persons = persons.filter(p => p.id !== id)
  console.log('persons after: ', persons)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const requestBody = request.body

  if (!requestBody.name) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (!requestBody.number) {
    return response.status(400).json({ error: 'number missing' })
  }

  const exists = persons.some(p => p.name.trim().toLowerCase() === requestBody.name.trim().toLowerCase())

  if (exists)
    return response.status(400).json({ error: 'name must be unique' })

  const person = {
    id: String(randInt(Number.MAX_SAFE_INTEGER)),
    name: requestBody.name,
    number: requestBody.number
  }

  persons = persons.concat(person)
  response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})