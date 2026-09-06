"use client";

import { useEffect, useState } from "react";
import { MessageCircle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteRsvpComment, deleteRsvpReply, fetchRsvpComments } from "@/lib/api";
import type { RsvpComment } from "@/types/invitation";

export function RsvpCommentsPanel() {
  const [comments, setComments] = useState<RsvpComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadComments() {
    setLoading(true);
    setError("");
    try {
      setComments(await fetchRsvpComments());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat komentar RSVP. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  async function removeComment(id: string) {
    if (!window.confirm("Hapus komentar RSVP ini beserta balasannya?")) return;
    setDeleting(id);
    try {
      await deleteRsvpComment(id);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus komentar.");
    } finally {
      setDeleting(null);
    }
  }

  async function removeReply(commentId: string, replyId: string) {
    if (!window.confirm("Hapus balasan ini?")) return;
    const key = `${commentId}:${replyId}`;
    setDeleting(key);
    try {
      await deleteRsvpReply(commentId, replyId);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus balasan.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="mt-8 card-glass rounded-3xl border border-[#D4AF37]/15 p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
            <MessageCircle className="h-5 w-5 text-[#D4AF37]" aria-hidden />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[color:var(--text-primary)]">Komentar RSVP</h2>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">Konfirmasi kehadiran dan balasan tamu</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={loadComments} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden /> Muat ulang
        </Button>
      </div>
      {loading && <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">Memuat komentar...</p>}
      {error && <p className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
      {!loading && !error && comments.length === 0 && <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">Belum ada komentar RSVP.</p>}
      <div className="mt-6 flex flex-col gap-4">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-2xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="font-serif font-semibold text-[color:var(--text-primary)]">{comment.name}</p>
                <button type="button" onClick={() => removeComment(comment.id)} disabled={deleting === comment.id} className="rounded-lg p-1 text-red-400 hover:bg-red-500/10 disabled:opacity-50" aria-label={`Hapus komentar dari ${comment.name}`}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <span className="rounded-full border border-[#D4AF37]/25 px-2.5 py-1 text-xs text-[#D4AF37]">
                {comment.attendance === "attending" ? `Hadir (${comment.guestCount})` : comment.attendance === "maybe" ? "Mungkin hadir" : "Tidak hadir"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">{comment.message}</p>
            {comment.replies.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 border-l-2 border-[#D4AF37]/30 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id}>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-[#D4AF37]">{reply.name}</p>
                      <button type="button" onClick={() => removeReply(comment.id, reply.id)} disabled={deleting === `${comment.id}:${reply.id}`} className="rounded-lg p-1 text-red-400 hover:bg-red-500/10 disabled:opacity-50" aria-label={`Hapus balasan dari ${reply.name}`}>
                        <Trash2 className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
