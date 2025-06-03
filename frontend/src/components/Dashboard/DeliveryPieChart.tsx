import React from 'react'
import { Pie } from 'react-chartjs-2'

import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

type PieChartProps = {
  labels: string[]
  values: number[]
  colors: string[]
  title?: string
}

const DeliveryPieChart: React.FC<PieChartProps> = ({
  labels,
  values,
  colors,
  title,
}) => {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Add this
    plugins: {
      title: {
        display: !!title,
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

  // Then in the return:
  return (
    <div
      style={{
        aspectRatio: '2 / 1', // ensures a square shape
      }}
    >
      <Pie data={data} options={options} />
    </div>
  )
}

export default DeliveryPieChart
