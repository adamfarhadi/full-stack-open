const Notification = ({ notification_type, message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={notification_type}>
      {message}
      {console.log(notification_type)}
    </div>
  )
}

export default Notification