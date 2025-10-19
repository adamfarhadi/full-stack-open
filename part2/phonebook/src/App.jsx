import { useState } from 'react'

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '040-123456', id: 1 },
    { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
    { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
    { name: 'Mary Poppendieck', number: '39-23-6423122', id: 4 }
  ])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  const addPerson = (event) => {
    event.preventDefault()

    const exists = persons.some(person => person.name.trim().toLowerCase() === newName.trim().toLowerCase())

    if (exists) {
      alert(`${newName} is already added to the phonebook`)
      return
    }

    const newPersons = persons.concat({ name: newName, number: newNumber })
    setPersons(newPersons)
    setNewName('')
    setNewNumber('')
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value.toLowerCase())
  }

  return (
    <div>
      <h1>Phonebook</h1>
      <form>
        <div>
          filter shown with <input value={filter} onChange={handleFilterChange} />
        </div>
      </form>
      <h2>Add a new person</h2>
      <form onSubmit={addPerson}>
        <div>
          name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      {
        persons
          .filter(person => person.name.toLowerCase().includes(filter))
          .map(person => <p key={person.name}>{person.name} {person.number}</p>)
      }
    </div>
  )
}

export default App