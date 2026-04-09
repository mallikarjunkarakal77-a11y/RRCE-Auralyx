import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
  className?: string;
}

export function StatCard({ label, value, suffix, highlight, className }: StatCardProps) {
  return (
    <div className={cn("glass-card p-4 text-center", highlight && "glow-primary border-primary/30", className)}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("text-2xl font-mono font-bold", highlight ? "text-primary" : "text-foreground")}>
        {value}
        {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
