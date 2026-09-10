import type { ReactNode } from "react";

interface SectionTitleProps {
  title: ReactNode;
  intro?: ReactNode;
  label?: string;
  align?: "left" | "center";
  invert?: boolean;
  as?: "h2" | "h3";
}

export function SectionTitle({
  title,
  intro,
  label,
  align = "left",
  invert = false,
  as: Heading = "h2",
}: SectionTitleProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {label ? (
        <p
          className={`mb-4 text-sm font-medium ${
            invert ? "text-primary" : "text-primary-ink"
          }`}
        >
          {label}
        </p>
      ) : null}
      <Heading className={`text-h2 font-semibold ${invert ? "text-white" : "text-dark"}`}>
        {title}
      </Heading>
      {intro ? (
        <div
          className={`mt-6 max-w-2xl text-lead ${invert ? "text-white/70" : "text-gray"} ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {intro}
        </div>
      ) : null}
    </div>
  );
}
