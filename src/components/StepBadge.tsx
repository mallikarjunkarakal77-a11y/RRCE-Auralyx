import { cn } from "@/lib/utils";

const stepColors: Record<number, string> = {
  1: "bg-step-1/15 text-step-1 border-step-1/30",
  2: "bg-step-2/15 text-step-2 border-step-2/30",
  3: "bg-step-3/15 text-step-3 border-step-3/30",
  4: "bg-step-4/15 text-step-4 border-step-4/30",
  5: "bg-step-5/15 text-step-5 border-step-5/30",
  6: "bg-step-6/15 text-step-6 border-step-6/30",
  7: "bg-step-7/15 text-step-7 border-step-7/30",
  8: "bg-step-8/15 text-step-8 border-step-8/30",
};

interface StepBadgeProps {
  step: number;
  label: string;
  className?: string;
}

export function StepBadge({ step, label, className }: StepBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold", stepColors[step], className)}>
      <span className="opacity-60">Step {step}</span>
      <span>{label}</span>
    </div>
  );
}
