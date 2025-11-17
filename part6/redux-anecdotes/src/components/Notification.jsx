import { useSelector } from "react-redux"

const Notification = () => {
  const style = {
    border: 'solid',
    padding: 10,
    borderWidth: 1,
    marginBottom: 10
  }

  const notificationMessage = useSelector(({ notification }) => {
    return notification
  })

  return <div style={style}>{notificationMessage}</div>
}

export default Notification
