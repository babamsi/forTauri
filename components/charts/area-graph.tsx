import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface AreaGraphProps {
  data: {
    name: string;
    total: number;
  }[];
}

export function AreaGraph({ data }: AreaGraphProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#adfa1d"
          fill="#adfa1d"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
