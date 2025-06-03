import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import {
  TextInput,
  Select,
  Button,
  Group,
  Container,
  Title,
  Space,
  Paper,
  Radio,
  Autocomplete,
} from '@mantine/core'
import { useForm } from '@mantine/form'

import { useDashboardStore, type DashboardState } from '@/stores/dashboardStore'

const SERVER_API = import.meta.env.VITE_SERVER_API

const fetchManufacturers = async () => {
  try {
    const response = await axios.get(`${SERVER_API}/api/manufacturers`)
    return response.data
  } catch (error) {
    console.error('Error fetching manufacturers:', error)
    return []
  }
}

// Fetch part names for a specific manufacturer
const fetchPartNames = async (manufacturer: string) => {
  try {
    const response = await axios.get(`${SERVER_API}/api/parts`, {
      params: { manufacturer },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching part names:', error)
    return []
  }
}

const fetchDashboardData = async (formData: FormState) => {
  try {
    const response = await axios.post(`${SERVER_API}/api/calculate`, formData)
    return response.data
  } catch (error: any) {
    throw new Error(
      'Error fetching data from server: ' + error.response.data.error,
    )
  }
}

interface FormState {
  manufacturer: string
  part_name: string
  serial_id: string
  equipment_type: 'Old' | 'New'
  pickup: string
  delivery: string
  G_pickup: string
  G_delivery: string
}

interface EmissionFormProps {
  onSuccess?: () => void // Add this prop to handle modal closing after success
}

export default function EmissionForm({ onSuccess }: EmissionFormProps) {
  const form = useForm<FormState>({
    initialValues: {
      manufacturer: '',
      part_name: '',
      serial_id: '',
      equipment_type: 'Old',
      pickup: '',
      delivery: '',
      G_pickup: '',
      G_delivery: '',
    },

    validate: {
      manufacturer: (value) =>
        value.trim().length === 0 ? 'Manufacturer is required' : null,
      pickup: (value) =>
        value.trim().length === 0 ? 'Pickup location is required' : null,
      delivery: (value) =>
        value.trim().length === 0 ? 'Delivery location is required' : null,
    },
  })

  //const navigate = useNavigate({ from: '/' })
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [parts, setParts] = useState<
    { part_name: string; serial_id: string }[]
  >([])

  useEffect(() => {
    const loadManufacturers = async () => {
      const fetchedManufacturers = await fetchManufacturers()
      setManufacturers(fetchedManufacturers)
    }
    loadManufacturers()
  }, [])

  // Fetch part names whenever the manufacturer changes
  const handleManufacturerChange = async (manufacturer: string) => {
    form.setFieldValue('manufacturer', manufacturer)
    if (manufacturer) {
      const fetchedPartNames = await fetchPartNames(manufacturer)
      setParts(fetchedPartNames)
    } else {
      setParts([])
    }
  }

  // Update part_name when serial_id is entered
  const handleSerialIdChange = (serialId: string) => {
    form.setFieldValue('serial_id', serialId)
    const selectedPart = parts.find((part) => part.serial_id === serialId)
    if (selectedPart) {
      form.setFieldValue('part_name', selectedPart.part_name)
    }
  }

  // Update serial_id when part_name is selected
  const handlePartNameChange = (partName: string) => {
    const selectedPart = parts.find(
      (part) => `${part.part_name} (${part.serial_id})` === partName,
    )

    if (selectedPart) {
      form.setFieldValue('part_name', selectedPart.part_name)
      form.setFieldValue('serial_id', selectedPart.serial_id)
    }
  }

  const mutation = useMutation({
    mutationFn: fetchDashboardData,
    onSuccess: (data) => {
      useDashboardStore.getState().setDashboardState(data)
      if (onSuccess) onSuccess() // Close the modal after successful submission
    },
    onError: (error) => {
      console.error('Submission failed:', error)
      alert('Submission failed. Please try again.')
    },
  })

  const handleSubmit = (values: FormState) => {
    mutation.mutate(values)
  }

  return (
    // <Paper w={'100%'} shadow="sm" radius="md" p="md" withBorder>
    <>
      <Title order={2}>Carbon Emission Calculator</Title>
      <Space h="xl" />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Autocomplete
          label="Manufacturer"
          placeholder="Search Manufacturers"
          data={manufacturers}
          onChange={handleManufacturerChange} // Update part names based on manufacturer
          value={form.values.manufacturer}
          required
        />
        <Space h="md" />
        <Autocomplete
          label="Part Name"
          placeholder="Search Part Names"
          data={parts.map((part) => `${part.part_name} (${part.serial_id})`)} // Show part_name and serial_id together
          value={form.values.part_name}
          onChange={handlePartNameChange}
        />
        <Space h="md" />
        <TextInput
          label="Serial ID"
          placeholder="Serial ID"
          value={form.values.serial_id}
          onChange={(event) => handleSerialIdChange(event.target.value)} // Update part_name when serial_id is entered
        />
        <Space h="md" />
        <Select
          label="Equipment Type"
          data={['Old', 'New']}
          {...form.getInputProps('equipment_type')}
        />
        <Space h="md" />
        <TextInput
          label="Pickup"
          placeholder="Pickup"
          {...form.getInputProps('pickup')}
        />
        <Space h="md" />
        <TextInput
          label="Delivery"
          placeholder="Delivery"
          {...form.getInputProps('delivery')}
        />
        <Space h="md" /> <Title order={4}>Global</Title>
        <TextInput
          label="Global Pickup"
          placeholder="Global Pickup"
          {...form.getInputProps('G\_pickup')}
        />
        <Space h="md" />
        <TextInput
          label="Global Delivery"
          placeholder="Global Delivery"
          {...form.getInputProps('G\_delivery')}
        />
        <Space h="md" />
        <Group>
          <Button type="submit" loading={mutation.isPending}>
            Calculate
          </Button>
        </Group>
      </form>
      {/* </Paper> */}
    </>
  )
}
