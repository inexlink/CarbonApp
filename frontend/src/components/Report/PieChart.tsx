import React from 'react'
import { View, Text, Svg, Path } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  chartContainer: {
    marginBottom: 20,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#e2e8f0',
    paddingTop: 10,
  },
  bar: {
    marginRight: 10,
    justifyContent: 'flex-end',
  },
  barFill: {
    backgroundColor: '#3182ce',
  },
  barLabel: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 4,
  },
  xAxisLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
})

const PieChart = ({
  data,
  title,
}: {
  data: { label: string; value: number; color: string }[]
  title: string
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercent = 0

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Pie chart visualization */}
        <View style={{ width: 150, height: 150, position: 'relative' }}>
          {data.map((item, index) => {
            const percent = (item.value / total) * 100
            const startAngle = cumulativePercent * 3.6 // 3.6 degrees per 1%
            cumulativePercent += percent
            const endAngle = cumulativePercent * 3.6

            // Calculate SVG arc path
            const x1 = 75 + 70 * Math.cos(((startAngle - 90) * Math.PI) / 180)
            const y1 = 75 + 70 * Math.sin(((startAngle - 90) * Math.PI) / 180)
            const x2 = 75 + 70 * Math.cos(((endAngle - 90) * Math.PI) / 180)
            const y2 = 75 + 70 * Math.sin(((endAngle - 90) * Math.PI) / 180)
            const largeArcFlag = percent > 50 ? 1 : 0

            const pathData = [
              `M 75 75`,
              `L ${x1} ${y1}`,
              `A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`,
            ].join(' ')

            return (
              <View
                key={index}
                style={{ position: 'absolute', width: 150, height: 150 }}
              >
                <Svg width="150" height="150" viewBox="0 0 150 150">
                  <Path d={pathData} fill={item.color} />
                </Svg>
              </View>
            )
          })}
        </View>

        {/* Legend */}
        <View style={{ marginLeft: 20 }}>
          {data.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 5,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: item.color,
                  marginRight: 5,
                }}
              />
              <Text style={{ fontSize: 10 }}>
                {item.label} ({Math.round((item.value / total) * 100)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default PieChart
