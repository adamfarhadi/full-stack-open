import { createContext, useReducer } from 'react'

const initialState = {
  notification_type: null,
  message: null,
}

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION':
      return action.payload
    case 'RESET_NOTIFICATION':
      return initialState
    default:
      return state
  }
}

const NotificationContext = createContext()

export const NotificationContextProvider = (props) => {
  const [notification, notificationDispatch] = useReducer(notificationReducer, initialState)

  const notify = (payload, timeInSeconds) => {
    notificationDispatch({
      type: 'SET_NOTIFICATION',
      payload,
    })
    setTimeout(() => {
      notificationDispatch({ type: 'RESET_NOTIFICATION' })
    }, 1000 * timeInSeconds)
  }

  return (
    <NotificationContext.Provider value={{ notification, notify }}>
      {props.children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
