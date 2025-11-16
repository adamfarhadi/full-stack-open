import { useDispatch, useSelector } from 'react-redux'
import { voteForAnecdote } from '../reducers/anecdoteReducer'

const AnecdoteList = () => {
  const dispatch = useDispatch()
  const anecdotes = useSelector(anecdotes => anecdotes)

  return (
    <div>
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
    </div>
  )
}

export default AnecdoteList