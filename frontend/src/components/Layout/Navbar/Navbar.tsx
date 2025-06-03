import {
  AppShell,
  NavLink,
  Tooltip,
  UnstyledButton,
  Flex,
  Burger,
} from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { IconHome, IconFileReport, IconFilePlus } from '@tabler/icons-react'

import classes from './Navbar.module.css'

const navLinks = [
  { icon: IconHome, label: 'Home', link: '/' },
  { icon: IconFileReport, label: 'Report', link: '/report' },
]

interface NavbarLinkProps {
  icon: typeof IconHome
  label: string
  active?: boolean
  link: string
  onClick?: () => void
}

function NavbarLink({
  icon: Icon,
  label,
  active,
  link,
  onClick,
}: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <Link to={link} style={{ textDecoration: 'none' }}>
        <UnstyledButton
          onClick={onClick}
          data-active={active || undefined}
          className={classes.link}
        >
          <Icon size={20} stroke={1.5} />
        </UnstyledButton>
      </Link>
    </Tooltip>
  )
}

interface NavbarProps {
  desktopOpened: boolean
  toggleDesktop: () => void
}

export default function Navbar({ desktopOpened, toggleDesktop }: NavbarProps) {
  const renderNavbarNavLinks = navLinks.map((navLink) => {
    if (desktopOpened) {
      return (
        <NavLink
          key={navLink.label} // Add a unique key to avoid React warnings
          component={Link}
          to={navLink.link}
          label={navLink.label}
        />
      )
    } else {
      return <NavbarLink {...navLink} key={navLink.label} />
    }
  })

  return (
    <>
      <AppShell.Section>
        <Flex justify="flex-end">
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
        </Flex>
      </AppShell.Section>

      <AppShell.Section grow mt="md">
        <Flex direction="column" justify="center" align="center" gap={0}>
          {renderNavbarNavLinks}
        </Flex>
      </AppShell.Section>
    </>
  )
}
