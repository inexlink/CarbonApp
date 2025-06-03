import React, { useEffect, useState } from 'react'
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Center,
  Group,
  Stack,
  Modal,
  Button,
} from '@mantine/core'

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'

import { useDashboardStore, type DashboardState } from '@/stores/dashboardStore'
import EmissionForm from '../EmissionForm/EmissionForm'
import DeliveryPieChart from './DeliveryPieChart'
import MaterialEmissionChart from './MaterialEmissionsChart'

const PRIMARY_COL_HEIGHT = '300px'

const MOCK_DATA = {
  final_emission: 0,
  equipment_type: 'None',
  part_name: 'No part selected',
  weight: 0,
  serial_id: 'N/A',
  new_total_emissions: 0,
  old_total_emissions: 0,
  component_chart: {
    labels: ['No data'],
    values: [100],
    colors: ['gray'],
  },
  chart_data: {
    labels: ['No data'],
    values: [100],
    colors: ['gray'],
  },
  map_html:
    '<div style="height: 400px; background: #f0f0f0; display: flex; justify-content: center; align-items: center;">No map data available</div>',
}

export default function Dashboard() {
  const [formOpened, setFormOpened] = useState(false)
  const dashboardData = useDashboardStore((state) => state.dashboardState)
  const [displayData, setDisplayData] = useState(MOCK_DATA)

  // Update display data when real data arrives
  useEffect(() => {
    if (dashboardData) {
      setDisplayData(dashboardData)
    }
  }, [dashboardData])

  // Open the modal automatically if there's no dashboard data
  useEffect(() => {
    if (!dashboardData) {
      setFormOpened(true)
    }
  }, [dashboardData])

  const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2.5 - var(--mantine-spacing-md) / 2)`

  return (
    <>
      <Modal
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        title="New Emissions Report"
        size="lg"
        centered
        overlayProps={{ blur: 2 }}
      >
        <EmissionForm onSuccess={() => setFormOpened(false)} />
      </Modal>

      <Group justify="space-between" px="sm" mt="md" mb="xs">
        <Title>Emissions Dashboard</Title>
        <Button onClick={() => setFormOpened(true)}>New Report</Button>
      </Group>

      <Container fluid my="md">
        <Grid>
          <Grid.Col span={4}>
            <Paper
              shadow="sm"
              radius="md"
              p="md"
              withBorder
              style={{ height: SECONDARY_COL_HEIGHT }}
            >
              <Title c="blue" order={3}>
                Total Emissions
              </Title>
              <Text size="xl" fw={500}>
                {displayData.final_emission.toLocaleString()} t CO2e
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper
              shadow="sm"
              radius="md"
              p="md"
              withBorder
              style={{ height: SECONDARY_COL_HEIGHT }}
            >
              <Title c="blue" order={3}>
                Equipment Info
              </Title>
              <Group justify="space-between" align="flex-start">
                <Stack gap={0}>
                  <Text size="lg" fw={500}>
                    Type: {displayData.equipment_type}
                  </Text>
                  <Text size="lg" fw={500}>
                    Part: {displayData.part_name}
                  </Text>
                </Stack>
                <Stack gap={0}>
                  <Text size="lg" fw={500}>
                    Weight: {displayData.weight} t
                  </Text>
                  <Text size="lg" fw={500}>
                    Serial ID: {displayData.serial_id}
                  </Text>
                </Stack>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper
              shadow="sm"
              radius="md"
              p="md"
              withBorder
              style={{ height: SECONDARY_COL_HEIGHT }}
            >
              <Title c="blue" order={3}>
                {displayData.equipment_type === 'Old'
                  ? 'Total Emissions Saved'
                  : 'Emissions saved if purchased Old'}
              </Title>
              <Text size="xl" fw={500}>
                {(
                  displayData.new_total_emissions -
                  displayData.old_total_emissions
                ).toLocaleString()}{' '}
                t CO2e
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper shadow="sm" radius="md" p="md" withBorder>
              <MaterialEmissionChart
                labels={displayData.component_chart.labels}
                values={displayData.component_chart.values}
                colors={displayData.component_chart.colors}
                title="Material Emissions (kg CO₂)"
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper shadow="sm" radius="md" p="md" withBorder>
              <DeliveryPieChart
                labels={displayData.chart_data.labels}
                values={displayData.chart_data.values}
                colors={displayData.chart_data.colors}
                title="Global vs Local Emissions (kg CO₂)"
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper shadow="sm" radius="md" p="xs" withBorder>
              <div dangerouslySetInnerHTML={{ __html: displayData.map_html }} />
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </>
  )
}
