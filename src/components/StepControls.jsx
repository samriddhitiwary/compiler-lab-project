export default function StepControls({ label, index, total, onPrevious, onNext, onAll, onReset, disabled, allLabel = 'Compute All' }) {
  const displayIndex = total === 0 ? 0 : Math.min(index, total)

  return (
    <div className="step-controls">
      <span>
        {label}: {displayIndex} / {total}
      </span>
      <div className="button-row compact">
        <button type="button" onClick={onPrevious} disabled={disabled || index <= 0}>
          Previous
        </button>
        <button type="button" onClick={onNext} disabled={disabled || index >= total}>
          Next Step
        </button>
        <button type="button" onClick={onAll} disabled={disabled || total === 0}>
          {allLabel}
        </button>
        <button type="button" className="ghost" onClick={onReset} disabled={disabled || index === 0}>
          Reset Steps
        </button>
      </div>
    </div>
  )
}
