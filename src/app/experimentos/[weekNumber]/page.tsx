import { notFound } from "next/navigation";
import { ExperimentDetailCard } from "@/components/experiments/experiment-detail-card";
import { EvidenceUploader } from "@/components/evidence/evidence-uploader";
import { experiments } from "@/lib/mock-data";

export default function ExperimentPage({ params }: { params: { weekNumber: string } }) {
  const week = Number(params.weekNumber);
  const experiment = experiments.find((item) => item.weekNumber === week);

  if (!experiment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ExperimentDetailCard experiment={experiment} />
      <EvidenceUploader />
    </div>
  );
}
