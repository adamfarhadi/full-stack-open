import { Route, useMatch } from 'react-router-dom'
import userService from '../services/users'
import { Routes, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AddedBlogsByUser from './AddedBlogsByUser'

const Users = () => {
  const result = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    refetchOnWindowFocus: false,
  })

  const match = useMatch('/users/:id')

  if (result.isError) {
    return <div>user service not available due to problems in server</div>
  }

  if (result.isLoading) {
    return <div>loading users...</div>
  }

  const users = result.data
  const userById = match ? users.find((u) => u.id === match.params.id) : null

  const usersForm = () => (
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
            <tr key={user.id}>
              <td>
                <Link to={`/users/${user.id}`}>{user.name}</Link>
              </td>
              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      {!match && usersForm()}
      <Routes>
        <Route path='/:id' element={<AddedBlogsByUser user={userById} />} />
      </Routes>
    </div>
  )
}

export default Users
