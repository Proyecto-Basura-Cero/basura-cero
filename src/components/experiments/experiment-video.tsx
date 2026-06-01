import { getYoutubeEmbedUrl, isDirectVideoUrl, isYoutubeUrl } from "@/lib/video";

export function ExperimentVideo({ videoUrl }: { videoUrl: string }) {
  const youtubeEmbed = getYoutubeEmbedUrl(videoUrl);

  return (
    <section className="mt-5 space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
        Video del experimento
      </h3>
      <p className="text-sm text-slate-600">
        Demostracion con materiales e instrucciones paso a paso.
      </p>
      {youtubeEmbed ? (
        <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-black">
          <iframe
            src={youtubeEmbed}
            title="Video del experimento"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : isDirectVideoUrl(videoUrl) || !isYoutubeUrl(videoUrl) ? (
        <video
          src={videoUrl}
          controls
          playsInline
          className="w-full rounded-xl border border-slate-200 bg-black"
        >
          Tu navegador no soporta reproduccion de video.
        </video>
      ) : (
        <a
          href={videoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Ver video
        </a>
      )}
    </section>
  );
}
