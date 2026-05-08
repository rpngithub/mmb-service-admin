import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#3498ff', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12', '#1abc9c']

const AppBarChart = ({ data, xKey, yKey, label, color, height = 220, multiColor = false }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
      <Tooltip />
      <Bar dataKey={yKey} name={label} fill={color || '#3498ff'} radius={[4, 4, 0, 0]}>
        {multiColor && data.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
)

export default AppBarChart
