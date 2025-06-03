import React, { useRef, useEffect, useState } from 'react'
import html2canvas from 'html2canvas'
import { PDFDocument } from './Report'
import MaterialEmissionChart from '../Dashboard/MaterialEmissionsChart'
import DeliveryPieChart from '../Dashboard/DeliveryPieChart'
import { PDFViewer } from '@react-pdf/renderer'

export const ChartImageRenderer = ({ data }) => {
  const materialRef = useRef(null)
  const deliveryRef = useRef(null)

  const [materialImage, setMaterialImage] = useState<string | null>(null)
  const [deliveryImage, setDeliveryImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const capture = async () => {
      try {
        if (!materialRef.current || !deliveryRef.current) {
          throw new Error('Chart references not found')
        }

        if (!data.component_chart || !data.chart_data) {
          throw new Error('Chart data is missing')
        }

        const materialCanvas = await html2canvas(materialRef.current)
        const deliveryCanvas = await html2canvas(deliveryRef.current)
        
        setMaterialImage(materialCanvas.toDataURL())
        setDeliveryImage(deliveryCanvas.toDataURL())
        setError(null)
      } catch (err) {
        console.error('Error generating chart images:', err)
        setError(err.message)
      }
    }

    capture()
  }, [data])

  if (error) {
    return <div>Error generating report: {error}</div>
  }

  return (
    <>
      {/* Hidden render for chart capture */}
      <div style={{ position: 'absolute', left: -9999, top: 0 }}>
        <div ref={materialRef}>
          <MaterialEmissionChart
            labels={data.component_chart.labels}
            values={data.component_chart.values}
            colors={data.component_chart.colors}
            title="Material Emissions Breakdown"
          />
        </div>
        <div ref={deliveryRef}>
          <DeliveryPieChart
            labels={data.chart_data.labels}
            values={data.chart_data.values}
            colors={data.chart_data.colors}
            title="Delivery Emissions Breakdown"
          />
        </div>
      </div>

      {/* Once captured, render report */}
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
