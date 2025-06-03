import React, { useEffect, useRef, useState } from 'react'
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Image,
} from '@react-pdf/renderer'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import { useDashboardStore } from '../../stores/dashboardStore'

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
)

// =================== Chart Components ===================
import MaterialEmissionChart from '../Dashboard/MaterialEmissionsChart'
import DeliveryPieChart from '../Dashboard/DeliveryPieChart'

// =================== Styles ===================
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a365d',
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
    color: '#2d3748',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  column: {
    width: '48%',
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f8fafc',
  },
  chartImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    objectFit: 'contain',
  },
  chartContainer: {
    marginBottom: 30,
  },
})

// =================== PDF Document ===================
const PDFDocument = ({
  data,
  materialImage,
  deliveryImage,
}: {
  data: any
  materialImage: string
  deliveryImage: string
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Emissions Report</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.subheader}>Summary</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.text}>
              Total Emissions: {data.final_emission.toLocaleString()} t CO2e
            </Text>
            <Text style={styles.text}>
              Equipment Type: {data.equipment_type}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.text}>Part Name: {data.part_name}</Text>
            <Text style={styles.text}>Weight: {data.weight} t</Text>
          </View>
        </View>
        <Text style={styles.text}>
          Emissions Saved:{' '}
          {(
            data.new_total_emissions - data.old_total_emissions
          ).toLocaleString()}{' '}
          t CO2e
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.subheader}>Material Emissions Breakdown</Text>
        {materialImage && (
          <Image src={materialImage} style={styles.chartImage} />
        )}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.subheader}>Delivery Method Distribution</Text>
        {deliveryImage && (
          <Image src={deliveryImage} style={styles.chartImage} />
        )}
      </View>
    </Page>
  </Document>
)

// =================== Chart Renderer ===================
const ChartImageRenderer = ({ data }: { data: any }) => {
  const materialRef = useRef<HTMLDivElement>(null)
  const deliveryRef = useRef<HTMLDivElement>(null)
  const [materialImage, setMaterialImage] = useState<string | null>(null)
  const [deliveryImage, setDeliveryImage] = useState<string | null>(null)

  useEffect(() => {
    const captureCharts = async () => {
      // Capture Material Emissions Chart
      if (materialRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const materialCanvas = await html2canvas(materialRef.current, {
          scale: 2,
          logging: true,
          useCORS: true,
        })
        setMaterialImage(materialCanvas.toDataURL('image/png'))
      }

      // Capture Delivery Pie Chart
      if (deliveryRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const deliveryCanvas = await html2canvas(deliveryRef.current, {
          scale: 2,
          logging: true,
          useCORS: true,
        })
        setDeliveryImage(deliveryCanvas.toDataURL('image/png'))
      }
    }

    captureCharts()
  }, [data])

  return (
    <>
      {/* Off-screen chart rendering */}
      <div
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '600px',
          height: '800px', // Increased height to accommodate both charts
        }}
      >
        {/* Material Emissions Chart */}
        <div
          ref={materialRef}
          style={{ width: '100%', height: '400px', marginBottom: '20px' }}
        >
          <MaterialEmissionChart
            labels={data.component_chart.labels}
            values={data.component_chart.values}
            colors={data.component_chart.colors}
            title="Material Emissions Breakdown"
          />
        </div>

        {/* Delivery Pie Chart */}
        <div ref={deliveryRef} style={{ width: '100%', height: '400px' }}>
          <DeliveryPieChart
            labels={data.delivery_chart.labels}
            values={data.delivery_chart.values}
            colors={data.delivery_chart.colors}
            title="Delivery Method Distribution"
          />
        </div>
      </div>

      {/* Render PDF after images are ready */}
      {materialImage && deliveryImage ? (
        <PDFViewer width="100%" height="100%">
          <PDFDocument
            data={data}
            materialImage={materialImage}
            deliveryImage={deliveryImage}
          />
        </PDFViewer>
      ) : (
        <div>Generating report...</div>
      )}
    </>
  )
}

// =================== Main Export Component ===================
export const Report = () => {
  const dashboardData = useDashboardStore((state) => state.dashboardState)

  if (!dashboardData) {
    return <div>No data available for report generation</div>
  }

  // Transform the data to match the expected format
  const reportData = {
    ...dashboardData,
    delivery_chart: dashboardData.chart_data // Map chart_data to delivery_chart
  }

  return <ChartImageRenderer data={reportData} />
}
