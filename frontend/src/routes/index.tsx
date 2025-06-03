import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '@/components/Dashboard/Dashboard'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <Dashboard />
}
