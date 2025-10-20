import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => setPersons(initialPersons))
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    
    const exists = persons.some(person => person.name.trim().toLowerCase() === newName.trim().toLowerCase())

    if (exists) {
      if (window.confirm(`${newName} is already added to the phonebook, replace the old number with a new one?`)) {
        const person = persons.find(p => p.name.trim().toLowerCase() === newName.trim().toLowerCase())
        updatePhoneNumber(person.id)
        return
      }
      else {
        return
      }
    }

    personService
      .create({ name: newName, number: newNumber })
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
      })
  }

  const updatePhoneNumber = (id) => {
    const person = persons.find(p => p.id === id)
    const updatedPerson = {...person, number: newNumber}

    personService
      .update(id, updatedPerson)
      .then(returnedPerson => {
        setPersons(persons.map(p => p.id === id ? returnedPerson : p))
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        window.alert(`Error updating phone number for ${person.name}`)
        setPersons(persons.filter(p => p.id !== id))
      })
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  return (
    <div>
      <h1>Phonebook</h1>
      <Filter filter={filter} filterChangeHandler={handleFilterChange} />
      <h2>Add a new person</h2>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        addPerson={addPerson}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons
        persons={persons}
        filter={filter}
        setPersons={setPersons}
      />
    </div>
  )
}

export default App