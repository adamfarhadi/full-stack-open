import { useDispatch, useSelector } from 'react-redux'
import { notify } from '../reducers/notificationReducer'
import { voteForAnecdote } from '../reducers/anecdoteReducer'

const AnecdoteList = () => {
  const dispatch = useDispatch()

  const anecdotes = useSelector(({ anecdotes, filter }) => {
    if (filter === '')
      return anecdotes

    return anecdotes
      .filter(anecdote => {
        return anecdote.content.toLowerCase().includes(filter.toLowerCase())
      })
  })

  const vote = anecdote => {
    dispatch(voteForAnecdote(anecdote))
    dispatch(notify(`You voted for '${anecdote.content}'`, 5))
  }

  return (
    <div>
      {anecdotes
        .slice()
        .sort((a, b) => b.votes - a.votes)
        .map(anecdote => (
          <div key={anecdote.id}>
            <div>{anecdote.content}</div>
            <div>
              has {anecdote.votes} {' '}
              <button onClick={() => vote(anecdote)}>vote</button>
            </div>
          </div>
        ))}
    </div>
  )
}

export default AnecdoteList