import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'

// Register necessary components of Chart.js
ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, Tooltip, Title)

type EmissionChartProps = {
  labels: string[] // Labels for the bar chart
  values: number[] // Emission values corresponding to each label
  colors: string[] // Colors for the bars in the chart
  title?: string // Optional title for the chart
}

const MaterialEmissionChart: React.FC<EmissionChartProps> = ({
  labels,
  values,
  colors,
  title,
}) => {
  // Bar chart data structure
  const data = {
    labels,
    datasets: [
      {
        label: 'Emissions (kg CO₂)', // Label for the dataset
        data: values,
        backgroundColor: colors,
      },
    ],
  }

  // Bar chart options with an optional title
  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false, // 💡 This removes the legend completely
      },
      title: {
        display: !!title, // Show title only if provided
        text: title,
        font: {
          size: 18,
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
    },
  }

  return (
    <div
      style={{
        aspectRatio: '2 / 1', // ensures a square shape
      }}
    >
      <Bar data={data} options={options} />
    </div>
  )
}

export default MaterialEmissionChart
