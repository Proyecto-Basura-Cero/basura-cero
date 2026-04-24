import { notFound } from "next/navigation";
import { ExperimentDetailCard } from "@/components/experiments/experiment-detail-card";
import { EvidenceUploader } from "@/components/evidence/evidence-uploader";
import { experiments } from "@/lib/mock-data";

type ExperimentPageProps = {
  params: Promise<{ weekNumber: string }>;
};

export default async function ExperimentPage({ params }: ExperimentPageProps) {
  const { weekNumber } = await params;
  const week = Number(weekNumber);
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
