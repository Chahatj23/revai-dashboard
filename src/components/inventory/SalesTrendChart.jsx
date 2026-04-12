import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { ChartContainer, ChartTooltipContent } from '../ui/ChartContainer';
import { format } from 'date-fns';

const SalesTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="glass-panel border-none h-full">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold text-white">Sales Cycles</CardTitle>
          <CardDescription>Visualizing revenue distribution over time.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground italic font-medium">Insufficient data for trend projection.</p>
        </CardContent>
      </Card>
    );
  }
  
  const chartConfig = {
    totalSales: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  };

  const formatXAxis = (tickItem) => {
    try {
      return format(new Date(tickItem), 'MMM d');
    } catch (e) {
      return tickItem;
    }
  };

  return (
    <Card className="glass-panel border-none shadow-2xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-extrabold text-white">Sales Cycles</CardTitle>
        <CardDescription>Live revenue stream tracking and projection.</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] pr-4 pt-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatXAxis}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}
              />
              <RechartsTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="totalSales"
                type="monotone"
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesTrendChart;
