/** shown at the bottom of every analysis screen */
export function AnalysisFooter({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-ink-mute ${className}`}>
      treatme is for cosmetic and educational use only. results are estimates, not a diagnosis or
      prescription. consult a licensed professional before any medical or cosmetic procedure.
    </p>
  );
}
