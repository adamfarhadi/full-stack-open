import { Route, useMatch } from 'react-router-dom'
import userService from '../services/users'
import { Routes, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AddedBlogsByUser from './AddedBlogsByUser'
import { TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Table, Paper } from '@mui/material'

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
      <Typography variant='h3' gutterBottom>
        Users
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Blogs Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell><Link to={`/users/${user.id}`}>{user.name}</Link></TableCell>
                <TableCell>{user.blogs.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
