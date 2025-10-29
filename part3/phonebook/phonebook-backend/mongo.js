const mongoose = require('mongoose')

if ((process.argv.length !== 4) && (process.argv.length !== 6)) {
  console.log('Usage: node mongo.js <username> <password> <name> <number>')
  process.exit(1)
}

const username = process.argv[2]
const password = process.argv[3]

const url = `mongodb+srv://${username}:${password}@full-stack-open.7cetmu4.mongodb.net/phonebook?retryWrites=true&w=majority&appName=full-stack-open`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema, 'Persons')

if (process.argv.length === 4) {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}

if (process.argv.length === 6) {
  const person = new Person({
    name: process.argv[4],
    number: process.argv[5]
  })

  person
    .save()
    .then(() => {
      console.log(`Added ${person.name} with number ${person.number} to phonebook`)
      mongoose.connection.close()
    })
}