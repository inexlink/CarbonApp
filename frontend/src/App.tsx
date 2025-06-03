import { MantineProvider } from '@mantine/core'
import '@mantine/notifications/styles.css'
import '@mantine/core/styles.css'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }

  // Add your custom state types here
  interface HistoryState {
    formData?: {
      manufacturer: string
      part_name: string
      serial_id: string
      equipment_type: string
      pickup: string
      delivery: string
      G_pickup: string
      G_delivery: string
    }
  }
}

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Create a new router instance
const router = createRouter({ routeTree, context: { queryClient } })

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <ModalsProvider>
          <Notifications position="bottom-right" />
          <RouterProvider router={router} />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}
