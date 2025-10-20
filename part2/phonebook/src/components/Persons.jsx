import personService from '../services/persons'

const Persons = ({ persons, filter, setPersons }) => {

  const removePerson = (person) => {
    if (window.confirm(`Delete ${person.name}?`))
      personService
        .remove(person.id)
        .then(returnedPerson => {
          setPersons(persons.filter(person => person.id !== returnedPerson.id))
        })
        .catch(error => console.log(error))
  }

  return (
    <>
      {
        persons
          .filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
          .map(person => 
            <p key={person.name}>{person.name} {person.number} 
              <button onClick={() => removePerson(person)}>delete</button>
            </p>
          )
      }
    </>
  )
}

export default Persons