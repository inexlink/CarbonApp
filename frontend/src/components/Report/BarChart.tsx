import React from 'react'
import { View, Text } from '@react-pdf/renderer'
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

const BarChart = ({
  data,
  title,
}: {
  data: { label: string; value: number }[]
  title: string
}) => {
  // Find max value for scaling
  const maxValue = Math.max(...data.map((item) => item.value))
  const scaleFactor = 150 / maxValue // 150 is our chart height

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.barContainer}>
        {data.map((item, index) => (
          <View
            key={index}
            style={[styles.bar, { width: `${80 / data.length}%` }]}
          >
            <View
              style={[
                styles.barFill,
                {
                  height: `${item.value * scaleFactor}pt`,
                },
              ]}
            />
            <Text style={styles.barLabel}>{item.value.toLocaleString()}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {data.map((item, index) => (
          <Text
            key={index}
            style={[styles.xAxisLabel, { width: `${80 / data.length}%` }]}
          >
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  )
}

export default BarChart
