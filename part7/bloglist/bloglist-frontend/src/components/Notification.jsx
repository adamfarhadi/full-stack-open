import { useContext } from 'react'
import { Alert } from '@mui/material'

import NotificationContext from '../NotificationContext'

const Notification = () => {
  const { notification } = useContext(NotificationContext)

  return (
    <div>{notification.message && <Alert severity={notification.notification_type}>{notification.message}</Alert>}</div>
  )
}

export default Notification
