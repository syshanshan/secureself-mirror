import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>;
}

interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}

export function CardHeader({ icon, title, subtitle }: CardHeaderProps) {
  return (
    <div className="mb-3 flex items-start gap-3">
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-rose-deep">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-display text-lg font-semibold text-text">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
