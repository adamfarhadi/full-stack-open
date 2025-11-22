import ReactDOM from 'react-dom/client'
import App from './App'
import { NotificationContextProvider } from './NotificationContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserContextProvider } from './UserContext'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <UserContextProvider>
      <NotificationContextProvider>
        <App />
      </NotificationContextProvider>
    </UserContextProvider>
  </QueryClientProvider>
)
