import { useState, useEffect } from 'react'
import axios from 'axios'

const PrintCountry = ({ country }) => {
  const liCapitalsStyle = {
    display: 'inline'
  }

  return (
    <>
      <h1>{country.name.common}</h1>
      <p>Capital(s):
        {
          country.capital
            .map(capital => <li key={capital} style={liCapitalsStyle}>{capital} </li>)
        }
      </p>
      <p>
        Area: {country.area}
      </p>
      <h2>Languages</h2>
      <ul>
        {
          Object.values(country.languages)
            .map(language => <li key={language}>{language}</li>)
        }
      </ul>
      <img src={country.flags.png}></img></>
  )
}

const PrintCountries = ({ countries, filter, setFilter }) => {
  if (countries === null || filter === '')
    return

  const filteredCountries = countries.filter(country => country.name.common.toLowerCase().includes(filter.toLowerCase()));

  if (filteredCountries.length > 10) {
    return (
      <p>Too many matches, specify another filter</p>
    )
  }

  if (filteredCountries.length > 1 && filteredCountries.length <= 10) {
    return (
      <>
        {
          filteredCountries
            .map(country =>
              <p key={country.name.common}>
                {country.name.common}
                <button onClick={() => setFilter(country.name.common)}>Show</button>
              </p>)
        }
      </>
    )
  }

  if (filteredCountries.length === 1) {
    const country = filteredCountries[0]
    return (
      <>
        <PrintCountry country={country} />
      </>
    )
  }

  if (filteredCountries.length === 0) {
    return (
      <p>No results found</p>
    )
  }

  return
}

const App = () => {
  const [filter, setFilter] = useState('')
  const [countries, setCountries] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  const handleChange = (event) => {
    event.preventDefault()
    setFilter(event.target.value)
  }

  return (
    <div>
      <form>
        find countries: <input value={filter} onChange={handleChange}></input>
      </form>
      {filter !== '' && <PrintCountries countries={countries} filter={filter} setFilter={setFilter}/>}
    </div>
  )
}

export default App
