import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";

export default function TokenGraph({ text }: { text: string }) {
  const [dataPoints, setDataPoints] = useState<number[]>([]);

  useEffect(() => {
    const tokens = Math.ceil(text.length / 4);

    setDataPoints(prev => [...prev.slice(-10), tokens]);
  }, [text]);

  const data = {
    labels: dataPoints.map((_, i) => i + 1),
    datasets: [
      {
        label: "Token Count",
        data: dataPoints
      }
    ]
  };

  return <Line data={data} />;
}