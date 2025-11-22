import { createContext, useReducer } from 'react'

const initialState = null

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload
    case 'CLEAR_USER':
      return initialState
    default:
      return state
  }
}

const UserContext = createContext()

export const UserContextProvider = (props) => {
  const [user, userDispatch] = useReducer(userReducer, initialState)

  return <UserContext.Provider value={{ user, userDispatch }}>{props.children}</UserContext.Provider>
}

export default UserContext
