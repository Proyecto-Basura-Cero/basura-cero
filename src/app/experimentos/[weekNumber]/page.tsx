import { notFound } from "next/navigation";
import { ExperimentDetailCard } from "@/components/experiments/experiment-detail-card";
import { EvidenceUploader } from "@/components/evidence/evidence-uploader";
import { getPublishedExperimentByWeekNumber } from "@/lib/services/experiments";

export const dynamic = "force-dynamic";

type ExperimentPageProps = {
  params: Promise<{ weekNumber: string }>;
};

export default async function ExperimentPage({ params }: ExperimentPageProps) {
  const { weekNumber } = await params;
  const week = Number(weekNumber);
  if (!Number.isFinite(week) || week < 1 || week > 52) {
    notFound();
  }

  let experiment = null;
  try {
    experiment = await getPublishedExperimentByWeekNumber(week);
  } catch {
    experiment = null;
  }

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
