"use client";

export interface AnimatedBackgroundProps {
  isScrolled: boolean;
  isComplete?: boolean;
}

export function AnimatedBackground({ isScrolled }: AnimatedBackgroundProps) {
  if (isScrolled) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 bg-primary/5" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 bg-secondary/5" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
