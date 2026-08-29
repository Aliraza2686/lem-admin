import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Pencil, Sparkles, ImageOff } from "lucide-react";
import { getAuthorName, formatDate } from "../articles/articleUtils";
import { useGlowPulse } from "../../hooks/useGlowPulse";

export default function SpotlightArticle({ article, loading }) {
  const glowRef = useGlowPulse(!loading && !!article);

  if (loading) {
    return <div className="dash-panel h-64 animate-pulse rounded-2xl" />;
  }

  if (!article) {
    return (
      <div className="dash-panel flex h-64 flex-col items-center justify-center gap-2 rounded-2xl text-center text-white/40">
        <Sparkles className="size-6" />
        <p className="text-sm">No articles published yet</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={glowRef}
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
      className="dash-panel relative h-64 overflow-hidden rounded-2xl"
      style={{ boxShadow: "0 0 0 1px rgba(79,209,255,calc(0.12 + 0.18 * var(--glow-opacity, 0))), 0 20px 40px -20px rgba(2,8,20,0.7)" }}
    >
      {article.coverImage?.url ? (
        <img src={article.coverImage.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/10">
          <ImageOff className="size-16" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/70 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center gap-1.5 self-start rounded-full bg-glow/15 px-2.5 py-1 text-[11px] font-semibold text-glow">
          <Sparkles className="size-3" />
          Latest published
        </div>

        <div>
          <h3 className="line-clamp-2 text-xl font-semibold text-white">{article.title}</h3>
          <p className="mt-1 text-sm text-white/60">
            {getAuthorName(article.author)} · {formatDate(article.publishedAt || article.createdAt)}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Link
              to={`/articles/${article.slug}`}
              className="flex items-center gap-1.5 rounded-lg bg-glow px-4 py-2 text-sm font-semibold text-primary-deep transition-colors duration-150 hover:bg-glow-soft"
            >
              <Eye className="size-4" />
              View
            </Link>
            <Link
              to={`/articles/${article.slug}/edit`}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors duration-150 hover:bg-white/10"
            >
              <Pencil className="size-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
