import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { AppShell } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Navbar from '@/components/Layout/Navbar/Navbar'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: Component,
})

function Component() {
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)

  return (
    <AppShell
      navbar={{
        width: { base: desktopOpened ? 260 : 60 },
        breakpoint: 'sm',
      }}
      padding="md"
    >
      {/* Navbar content */}
      <AppShell.Navbar p="md">
        <Navbar desktopOpened={desktopOpened} toggleDesktop={toggleDesktop} />
      </AppShell.Navbar>

      <AppShell.Main bg={'#f8f9fa'} h={'100vh'}>
        <Outlet />
        <TanStackRouterDevtools />
      </AppShell.Main>
    </AppShell>
  )
}
