import { useState } from 'react'
import OperatorPrecedence from './OperatorPrecedence'

export default function BottomUpParsing() {
  const [activeTab, setActiveTab] = useState('opp')

  return (
    <main className="page">
      <section className="module-header">
        <div>
          <p className="eyebrow">Bottom-Up Parsing</p>
          <h2>Parsing Modules</h2>
        </div>
        <div className="tab-row" role="tablist" aria-label="Bottom-up parsing modules">
          <button type="button" className={activeTab === 'lr' ? 'active' : ''} onClick={() => setActiveTab('lr')}>
            LR Parsing
          </button>
          <button type="button" className={activeTab === 'opp' ? 'active' : ''} onClick={() => setActiveTab('opp')}>
            Operator Precedence Parsing
          </button>
        </div>
      </section>

      {activeTab === 'lr' ? (
        <section className="panel">
          <h2>LR Parsing</h2>
          <p className="muted">LR Parsing Module - Not part of current Review-1 implementation.</p>
        </section>
      ) : (
        <OperatorPrecedence />
      )}
    </main>
  )
}
