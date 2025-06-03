import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@mantine/core'

import { Report } from '@/components/Report/Report'

// Define the route for "/report"
export const Route = createFileRoute('/report')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Container h={'100%'}>
      <Report />
    </Container>
  )
}
