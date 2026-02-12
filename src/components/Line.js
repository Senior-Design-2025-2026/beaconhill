import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Format timestamp for axis label (handles Unix seconds, ms, or raw numbers)
function formatTimestamp(ts) {
  if (ts == null) return ''
  const n = Number(ts)
  if (n >= 1e12) return new Date(n).toLocaleString()      // ms
  if (n >= 1e9) return new Date(n * 1000).toLocaleString() // seconds
  return String(ts)
}

// Map API array [{ timestamp, temperature }, ...] to Chart.js format
function apiDataToChartData(apiData) {
  // If the API data is not an array, or the array is empty, return an empty object
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return { labels: [], datasets: [] }
  }

  // Timestamps are the labels (x-axis)
  const labels = apiData.map(item => formatTimestamp(item.timestamp))

  // Temperature is the data (y-axis)
  const datasets = [
    {
      label: 'Temperature',
      data: apiData.map(item => item.temperature),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.1)',
      tension: 0.3,
    },
  ]
  return { labels, datasets }
}

export const LineGraph = ({ data: apiData }) => {
  const chartData = apiDataToChartData(apiData)
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Temperature over time' },
      tooltip: {
        callbacks: {
          label: (ctx) => `Temperature: ${ctx.parsed.y}°`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Temperature (°)' },
      },
    },
  }
  return <Line options={options} data={chartData} />
}