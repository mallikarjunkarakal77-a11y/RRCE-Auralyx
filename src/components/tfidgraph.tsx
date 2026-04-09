import { Bar } from "react-chartjs-2";

export default function TFIDFGraph({ words, scores }: any) {
  const data = {
    labels: words,
    datasets: [
      {
        label: "TF-IDF",
        data: scores
      }
    ]
  };

  return <Bar data={data} />;
}