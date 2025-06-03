import { create } from 'zustand'

export interface DashboardState {
  weight: number
  manufacturer: string
  part_name: string
  serial_id: string
  equipment_type: string
  created_emission: number
  final_emission: number
  old_total_emissions: number
  new_total_emissions: number
  logistics_info: any
  G_logistics_info: any
  chart_data: any
  component_chart: any
  map_html: any
}

type DashboardStore = {
  dashboardState: DashboardState | null
  setDashboardState: (data: DashboardState) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  dashboardState: null,
  setDashboardState: (data) => set({ dashboardState: data }),
}))
