"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, MessageCircle, Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useGuestbook } from "@/hooks/useGuestbook";
import { guestbookSchema } from "@/lib/validators";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";
import type { GuestbookEntry } from "@/types/invitation";
import { cn } from "@/lib/utils";
import {
  fetchRsvpComments,
  submitRsvpReply,
  updateRsvpComment,
  deleteRsvpComment,
  updateRsvpReply,
  deleteRsvpReply,
} from "@/lib/api";
import type { RsvpComment } from "@/types/invitation";

interface FormErrors {
  name?: string;
  message?: string;
}

interface EntryCardProps {
  entry: GuestbookEntry;
  index: number;
}

export function RsvpComments() {
  const [comments, setComments] = useState<RsvpComment[]>([]);
  const [reply, setReply] = useState<Record<string, string>>({});
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyMessage, setEditReplyMessage] = useState("");

  useEffect(() => {
    const pathName = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
    if (pathName && pathName !== "admin") {
      setGuestName(decodeURIComponent(pathName).replace(/[-_]+/g, " ").slice(0, 80));
    }

    async function loadComments() {
      setLoading(true);
      try {
        setComments(await fetchRsvpComments());
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat komentar RSVP.");
      } finally {
        setLoading(false);
      }
    }

    loadComments();
    window.addEventListener("rsvp-updated", loadComments);
    return () => window.removeEventListener("rsvp-updated", loadComments);
  }, []);

  async function handleReply(commentId: string) {
    const message = reply[commentId]?.trim();
    if (!guestName || !message || sending) return;

    setSending(commentId);
    try {
      await submitRsvpReply(commentId, guestName, message);
      setReply((current) => ({ ...current, [commentId]: "" }));
      setComments(await fetchRsvpComments());
    } finally {
      setSending(null);
    }

  }

  async function handleDelete(commentId: string) {
    if (!window.confirm("Hapus komentar RSVP ini?")) return;
    setSending(commentId);
    try {
      await deleteRsvpComment(commentId);
      setComments(await fetchRsvpComments());
    } finally {
      setSending(null);
    }
  }

  async function handleEdit(comment: RsvpComment) {
    if (!editMessage.trim()) return;
    setSending(comment.id);
    try {
      await updateRsvpComment(comment.id, guestName, {
        attendance: comment.attendance,
        guestCount: comment.guestCount,
        message: editMessage,
      });
      setEditing(null);
      setComments(await fetchRsvpComments());
    } finally {
      setSending(null);
    }
  }

  async function handleDeleteReply(commentId: string, replyId: string) {
    if (!window.confirm("Hapus balasan ini?")) return;
    setSending(replyId);
    try {
      await deleteRsvpReply(commentId, replyId);
      setComments(await fetchRsvpComments());
    } finally {
      setSending(null);
    }
  }

  async function handleEditReply(commentId: string, replyId: string) {
    if (!editReplyMessage.trim()) return;
    setSending(replyId);
    try {
      await updateRsvpReply(commentId, replyId, guestName, editReplyMessage);
      setEditingReply(null);
      setComments(await fetchRsvpComments());
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="mt-10 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-[#D4AF37]" aria-hidden />
        <h3 className="font-serif text-xl font-semibold text-[color:var(--text-primary)]">
          Komentar Kehadiran
        </h3>
      </div>
      {loading && (
        <p className="text-sm text-[color:var(--text-muted)]">
          Memuat komentar...
        </p>
      )}
      {!loading && error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
          Komentar RSVP belum dapat dimuat.
        </p>
      )}
      {!loading && !error && comments.length === 0 && (
        <p className="rounded-2xl border border-[#D4AF37]/15 p-5 text-center text-sm text-[color:var(--text-muted)]">
          Belum ada komentar RSVP. Konfirmasi kehadiran Anda akan tampil di sini.
        </p>
      )}
      {comments.map((comment) => (
        <article key={comment.id} className="card-glass rounded-2xl border border-[#D4AF37]/15 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="font-serif font-semibold text-[color:var(--text-primary)]">
                {comment.name}
              </p>
              {comment.name.trim().toLowerCase() === guestName.trim().toLowerCase() && (
                <>
                  <button type="button" onClick={() => {
                    setEditing(comment.id);
                    setEditMessage(comment.message);
                  }} className="text-[#D4AF37]" aria-label="Edit komentar">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => handleDelete(comment.id)} className="text-red-400" aria-label="Hapus komentar">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
            <span className="text-xs text-[color:var(--text-muted)]">
              {comment.attendance === "attending" ? "Hadir" : comment.attendance === "maybe" ? "Mungkin hadir" : "Tidak hadir"}
            </span>
          </div>
          {editing === comment.id ? (
            <div className="mt-3 flex gap-2">
              <input value={editMessage} onChange={(event) => setEditMessage(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-[#D4AF37]/25 bg-transparent px-3 py-2 text-sm" maxLength={500} />
              <Button type="button" size="sm" onClick={() => handleEdit(comment)} loading={sending === comment.id} aria-label="Simpan edit"><Check className="h-4 w-4" /></Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)} aria-label="Batalkan edit"><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              {comment.message || `Konfirmasi untuk ${comment.guestCount} orang.`}
            </p>
          )}
          {comment.replies.map((item) => (
            <div key={item.id} className="mt-3 border-l-2 border-[#D4AF37]/30 pl-4">
              <div className="flex items-center gap-2">
                <p className="font-serif text-sm font-semibold text-[#D4AF37]">{item.name}</p>
                {item.name.trim().toLowerCase() === guestName.trim().toLowerCase() && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReply(item.id);
                        setEditReplyMessage(item.message);
                      }}
                      className="text-[#D4AF37]"
                      aria-label="Edit balasan"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReply(comment.id, item.id)}
                      className="text-red-400"
                      aria-label="Hapus balasan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
              {editingReply === item.id ? (
                <div className="mt-2 flex gap-2">
                  <input
                    value={editReplyMessage}
                    onChange={(event) => setEditReplyMessage(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-[#D4AF37]/25 bg-transparent px-3 py-2 text-sm"
                    maxLength={500}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleEditReply(comment.id, item.id)}
                    loading={sending === item.id}
                    aria-label="Simpan edit balasan"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingReply(null)}
                    aria-label="Batalkan edit balasan"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{item.message}</p>
              )}
            </div>
          ))}
          {guestName && (
            <div className="mt-4 flex gap-2">
              <input
                value={reply[comment.id] ?? ""}
                onChange={(event) =>
                  setReply((current) => ({ ...current, [comment.id]: event.target.value }))
                }
                placeholder={`Balas sebagai ${guestName}`}
                className="min-w-0 flex-1 rounded-xl border border-[#D4AF37]/25 bg-transparent px-3 py-2 text-sm text-[color:var(--text-primary)]"
                maxLength={500}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => handleReply(comment.id)}
                loading={sending === comment.id}
                aria-label="Kirim balasan"
              >
                <Send className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function EntryCard({ entry, index }: EntryCardProps) {
  const formattedDate = new Date(entry.timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
        ease: [0.19, 1, 0.22, 1],
      }}
      className="card-glass rounded-2xl p-5 border border-[#D4AF37]/12 shadow-[0_2px_12px_rgba(212,175,55,0.06)]"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]"
          aria-hidden
        >
          <span className="font-serif text-base font-semibold">
            {entry.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-serif text-sm font-semibold text-[color:var(--text-primary)] truncate">
              {entry.name}
            </span>
            <time
              className="text-xs text-[color:var(--text-muted)] shrink-0"
              dateTime={entry.timestamp}
            >
              {formattedDate}
            </time>
          </div>
          <p className="mt-1.5 font-sans text-sm leading-relaxed text-[color:var(--text-secondary)] break-words">
            {entry.message}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 pl-12" aria-hidden>
        <Heart className="h-3 w-3 text-[#D4AF37]/50" />
        <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/20 to-transparent" />
      </div>
    </motion.article>
  );
}

export function GuestbookSection() {
  const { entries, fetchState, submitState, load, submit, resetSubmit } =
    useGuestbook();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = guestbookSchema.safeParse({ name, message });
    if (!parsed.success) {
      const fe: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        fe[field] = issue.message;
      }
      setErrors(fe);
      return;
    }

    const success = await submit(parsed.data);
    if (success) {
      setSubmitted(true);
      setName("");
      setMessage("");
      setTimeout(() => {
        setSubmitted(false);
        resetSubmit();
      }, 4000);
    }
  }

  const isLoading = submitState.status === "loading";

  return (
    <section className="py-16 section-padding overflow-hidden" aria-label="Komentar RSVP">
      <div className="mx-auto max-w-2xl">
        <RsvpComments />
      </div>
    </section>
  );
}
