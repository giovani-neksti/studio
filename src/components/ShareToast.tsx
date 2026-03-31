'use client';

interface ShareToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function ShareToast({ message, onDismiss }: ShareToastProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      onClick={onDismiss}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] px-4 py-3 rounded-[var(--shape-medium)] bg-[var(--inverse-surface,#2d2d2d)] text-[var(--inverse-on-surface,#f5f5f5)] md3-body-medium shadow-xl animate-fade-up cursor-pointer"
    >
      {message}
    </div>
  );
}
