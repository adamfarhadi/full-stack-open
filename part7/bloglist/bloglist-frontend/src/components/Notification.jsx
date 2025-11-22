import { useContext } from 'react'

import NotificationContext from '../NotificationContext'

const Notification = () => {
  const { notification } = useContext(NotificationContext)

  if (notification.message === null) {
    return null
  }

  return <div className={notification.notification_type}>{notification.message}</div>
}

export default Notification
