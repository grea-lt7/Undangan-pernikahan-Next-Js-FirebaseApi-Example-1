"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { fetchCoHosts, fetchCoHostsTitleMode } from "@/lib/api";

export function CoHostsSection() {
  const [lines, setLines] = useState<string[]>([]);
  const [titleMode, setTitleMode] = useState(false);

  useEffect(() => {
    Promise.all([fetchCoHosts(), fetchCoHostsTitleMode()])
      .then(([value, enabled]) => {
        setLines(value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
        setTitleMode(enabled);
      })
      .catch((error) => console.error("Gagal memuat daftar turut mengundang:", error));
  }, []);

  if (!lines.length) return null;

  return (
    <section
      id="coHosts"
      className="relative overflow-hidden py-16 section-padding sm:py-20"
      aria-label="Turut mengundang"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal direction="up">
          <div className="card-glass mx-auto w-full max-w-3xl rounded-3xl border border-[#D4AF37]/20 px-5 py-7 text-center sm:px-10 sm:py-9">
            <h2 className="font-serif text-xl font-semibold gold-text sm:text-2xl">
              Turut Mengundang
            </h2>
            <div className="gold-divider mx-auto mt-4 w-20" aria-hidden />
            <div className="mt-6 flex flex-col items-center gap-3">
              {lines.map((line, index) => {
                const title = line.match(/^\*\*(.+)\*\*$/)?.[1]?.trim();
                const text = title ?? line.replace(/\*\*/g, "");

                return (
                  <p
                    key={`${index}-${line}`}
                    className={
                      titleMode && title
                        ? "max-w-full break-words font-serif text-xs font-semibold leading-relaxed text-[#D4AF37] sm:text-sm"
                        : "max-w-full break-words font-serif text-sm leading-relaxed text-[color:var(--text-primary)] sm:text-base"
                    }
                  >
                    {text}
                  </p>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
