export function AdminFieldActions({
  fieldLabel,
  example,
  onClear,
  onUseExample,
}: {
  fieldLabel: string;
  example: string;
  onClear: () => void;
  onUseExample: () => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onClear}
        aria-label={`Hapus semua isi ${fieldLabel}`}
        className="rounded-lg border border-[#D4AF37]/20 px-3 py-1.5 text-xs text-[color:var(--text-muted)] transition-colors hover:border-red-400/40 hover:text-red-400"
      >
        Hapus semua
      </button>
      <button
        type="button"
        onClick={onUseExample}
        aria-label={`Isi ${fieldLabel} dengan contoh`}
        title={`Contoh: ${example}`}
        className="rounded-lg border border-[#D4AF37]/25 px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition-colors hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
      >
        Isi contoh
      </button>
    </div>
  );
}
