import userService from '../services/users'

import { useQuery } from '@tanstack/react-query'

const Users = () => {
  const result = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    refetchOnWindowFocus: false,
  })

  if (result.isError) {
    return <div>user service not available due to problems in server</div>
  }

  if (result.isLoading) {
    return <div>loading users...</div>
  }

  const users = result.data

  return (
    <div>
      <h2>Users</h2>
      <table style={{ textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Blogs Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.username}>
              <td>{user.name}</td>
              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Users
