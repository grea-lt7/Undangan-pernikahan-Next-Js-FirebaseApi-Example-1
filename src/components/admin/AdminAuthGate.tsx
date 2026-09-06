"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogOut, Save } from "lucide-react";
import { getAdminPasswordHash, isAdminAuthenticated, saveAdminPassword, setAdminAuthenticated, verifyAdminPassword } from "@/lib/adminAuth";
import { Button } from "@/components/ui/Button";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordHash, setPasswordHash] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      setLoading(false);
      return;
    }
    getAdminPasswordHash()
      .then(setPasswordHash)
      .then(() => setAuthenticated(true))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat autentikasi."))
      .finally(() => setLoading(false));
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const hash = passwordHash ?? await getAdminPasswordHash();
      if (!(await verifyAdminPassword(password, hash))) {
        setError("Sandi admin salah.");
        return;
      }
      if (!hash) {
        await saveAdminPassword(password);
        setPasswordHash(await getAdminPasswordHash());
      }
      setAdminAuthenticated(true);
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk ke Admin.");
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 6) {
      setError("Sandi baru minimal 6 karakter.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveAdminPassword(newPassword);
      setPasswordHash(null);
      setNewPassword("");
      setError("Sandi berhasil diperbarui.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui sandi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen" />;
  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <form onSubmit={login} className="card-glass w-full max-w-md rounded-3xl border border-[#D4AF37]/15 p-6 sm:p-8">
          <LockKeyhole className="mb-4 h-8 w-8 text-[#D4AF37]" aria-hidden />
          <h1 className="font-serif text-3xl font-bold gold-text">Admin Terkunci</h1>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Masukkan sandi untuk melanjutkan.</p>
          <div className="relative mt-5">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-[#D4AF37]/30 bg-transparent px-4 py-3 pr-12" placeholder="Sandi admin" autoFocus />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] hover:text-[#D4AF37]" aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}>
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
          <Button type="submit" className="mt-4 w-full justify-center">Masuk</Button>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <>
      {children}
      <div className="mx-auto mt-8 mb-6 flex w-[calc(100%-1.5rem)] max-w-md flex-col items-stretch gap-2 rounded-2xl border border-[#D4AF37]/20 bg-[var(--bg-primary)]/95 p-3 shadow-lg backdrop-blur sm:w-fit sm:max-w-none sm:flex-row sm:items-center sm:p-2">
        {showPasswordForm && (
          <form onSubmit={changePassword} className="flex w-full gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Sandi baru" className="w-full rounded-lg border border-[#D4AF37]/30 bg-[var(--bg-primary)] px-2 py-2 pr-8 text-xs sm:w-40" />
              <button type="button" onClick={() => setShowNewPassword((current) => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] hover:text-[#D4AF37]" aria-label={showNewPassword ? "Sembunyikan sandi baru" : "Tampilkan sandi baru"}>
                {showNewPassword ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
              </button>
            </div>
            <Button type="submit" size="sm" variant="outline" loading={saving} className="shrink-0"><Save className="h-4 w-4" aria-hidden /> Simpan</Button>
          </form>
        )}
        <Button type="button" size="sm" variant="outline" onClick={() => setShowPasswordForm((current) => !current)} className="w-full justify-center sm:w-auto">
          <Save className="h-4 w-4" aria-hidden /> {showPasswordForm ? "Tutup" : "Ganti Sandi"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => { setAdminAuthenticated(false); setAuthenticated(false); }} aria-label="Keluar Admin" className="w-full justify-center sm:w-auto"><LogOut className="h-4 w-4" aria-hidden /> Keluar</Button>
      </div>
      {error && <p className="mx-auto mb-6 w-[calc(100%-1.5rem)] max-w-md rounded-xl bg-[var(--bg-primary)] px-4 py-3 text-sm text-[#D4AF37]">{error}</p>}
    </>
  );
}
