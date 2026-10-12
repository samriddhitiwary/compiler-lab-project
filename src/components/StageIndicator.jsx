export default function StageIndicator({ parseOk, validationOk, setsReady, tableReady }) {
  const stages = [
    ['Grammar Input', parseOk],
    ['Validation', validationOk],
    ['LEADING/TRAILING', setsReady],
    ['Precedence Table', tableReady],
  ]

  return (
    <div className="stage-indicator">
      {stages.map(([label, done], index) => (
        <div key={label} className={done ? 'done' : 'pending'}>
          <span>{done ? '✓' : index + 1}</span>
          {label}
        </div>
      ))}
    </div>
  )
}
