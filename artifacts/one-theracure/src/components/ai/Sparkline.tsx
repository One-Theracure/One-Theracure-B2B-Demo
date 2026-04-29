interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  stroke?: number;
  fill?: boolean;
}

export default function Sparkline({
  data, width = 100, height = 32, color = "#7c3aed", stroke = 2, fill = true,
}: SparklineProps) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data.map((d, i) => [i * stepX, height - ((d - min) / range) * (height - 4) - 2] as [number, number]);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const fillPath = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fill && <path d={fillPath} fill={color} opacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={2.5} fill={color} />
    </svg>
  );
}
