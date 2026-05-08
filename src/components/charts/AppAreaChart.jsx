import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AppAreaChart = ({ data, xKey, yKey, label, color = '#3498ff', height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.25} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
      <Tooltip />
      <Area type="monotone" dataKey={yKey} name={label} stroke={color} fill={`url(#grad-${yKey})`} strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
)

export default AppAreaChart
