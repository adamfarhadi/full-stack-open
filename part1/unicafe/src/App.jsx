import { useState } from 'react'

const Button = ({ onClick, text }) => {
  return (
    <button onClick={onClick}>{text}</button>
  )
}

const StatisticsLine = ({ text, value }) => {
  return (
    <p>{text} {value}</p>
  )
}

const Statistics = ({ good, neutral, bad }) => {
  if (good === 0 && neutral === 0 && bad === 0) return (
    <>
      <h1>statistics</h1>
      <p>No feedback given</p>
    </>
  )
  else return (
    <>
      <h1>statistics</h1>
      <StatisticsLine text="good" value={good} />
      <StatisticsLine text="neutral" value={neutral} />
      <StatisticsLine text="bad" value={bad} />
      <StatisticsLine text="all" value={good + neutral + bad} />
      <StatisticsLine text="average" value={((good - bad) / (good + neutral + bad)) || 0} />
      <StatisticsLine text="positive" value={`${(((good / (good + neutral + bad) * 100) || 0))} %`} />
    </>
  )
}

const App = () => {
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h1>give feedback</h1>
      <Button onClick={() => { setGood(good + 1) }} text="good" />
      <Button onClick={() => { setNeutral(neutral + 1) }} text="neutral" />
      <Button onClick={() => { setBad(bad + 1) }} text="bad" />
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App