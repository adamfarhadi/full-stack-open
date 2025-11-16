import { useSelector, useDispatch } from 'react-redux'
import { voteForAnecdote } from './reducers/anecdoteReducer'
import AnecdoteForm from './components/AnecdoteForm'

const App = () => {
  const dispatch = useDispatch()
  const anecdotes = useSelector(state => state)

  return (
    <div>
      <h2>Anecdotes</h2>
      {anecdotes
        .sort((a, b) => b.votes - a.votes)
        .map(anecdote => (
          <div key={anecdote.id}>
            <div>{anecdote.content}</div>
            <div>
              has {anecdote.votes} {' '}
              <button onClick={() => dispatch(voteForAnecdote(anecdote.id))}>vote</button>
            </div>
          </div>
        ))}
      <AnecdoteForm />
    </div>
  )
}

export default App
