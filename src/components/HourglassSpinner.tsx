import { cn } from "@/lib/utils";

interface HourglassSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizes = {
  sm: "text-lg",
  md: "text-3xl",
  lg: "text-5xl",
};

const HourglassSpinner = ({ size = "md", className, label }: HourglassSpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <span className={cn("inline-block animate-spin", sizes[size])} style={{ animationDuration: "2s" }}>
        ⏳
      </span>
      {label && (
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};

export default HourglassSpinner;
