import { ReactNode, useEffect, useId, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

type DialogVariant = 'info' | 'warning' | 'danger' | 'success';
type ConfirmTone = 'primary' | 'danger' | 'success';

interface AppDialogProps {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  variant?: DialogVariant;
  confirmTone?: ConfirmTone;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  closeOnOverlayClick?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const variantStyles: Record<
  DialogVariant,
  {
    badgeClassName: string;
    iconClassName: string;
    label: string;
    icon: ReactNode;
  }
> = {
  info: {
    badgeClassName: 'border-brand-border bg-brand-soft text-brand-text',
    iconClassName: 'bg-brand text-text-inverted',
    label: 'Informacja',
    icon: <Info className="h-4 w-4" />,
  },
  warning: {
    badgeClassName: 'border-warning-border bg-warning-soft text-warning-text',
    iconClassName: 'bg-warning-icon text-text-inverted',
    label: 'Uwaga',
    icon: <TriangleAlert className="h-4 w-4" />,
  },
  danger: {
    badgeClassName: 'border-danger-border bg-danger-soft text-danger-text',
    iconClassName: 'bg-danger text-text-inverted',
    label: 'Ostrzeżenie',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  success: {
    badgeClassName: 'border-success-border bg-success-soft text-success-text',
    iconClassName: 'bg-success text-text-inverted',
    label: 'Sukces',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

const confirmToneClassNames: Record<ConfirmTone, string> = {
  primary:
    'bg-btn-dark text-text-inverted hover:bg-btn-dark-hover active:bg-btn-dark-active focus-visible:ring-brand-ring',
  danger:
    'bg-danger text-text-inverted hover:opacity-90 active:bg-danger-active-bg focus-visible:ring-danger-ring',
  success:
    'bg-success text-text-inverted hover:bg-success-hover active:bg-success-active focus-visible:ring-success-ring',
};

export default function AppDialog({
  open,
  title,
  description,
  children,
  variant = 'info',
  confirmTone = 'primary',
  confirmLabel = 'OK',
  cancelLabel = 'Anuluj',
  showCancel = true,
  closeOnOverlayClick = true,
  onConfirm,
  onClose,
}: AppDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const focusTimer = window.setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 10);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const variantStyle = variantStyles[variant];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-overlay backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description || children ? descriptionId : undefined}
          className="w-full max-w-md rounded-[28px] border border-border bg-surface-card p-5 shadow-2xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${variantStyle.badgeClassName}`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full ${variantStyle.iconClassName}`}>
                  {variantStyle.icon}
                </span>
                {variantStyle.label}
              </span>
              <h3 id={titleId} className="mt-3 text-xl font-bold text-text-primary break-words">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
              aria-label="Zamknij okno"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {(description || children) && (
            <div id={descriptionId} className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
              {description ? <p>{description}</p> : null}
              {children}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {showCancel ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-surface-raised px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-inset focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {cancelLabel}
              </button>
            ) : null}
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onConfirm}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${confirmToneClassNames[confirmTone]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
