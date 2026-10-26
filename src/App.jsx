import { useState } from 'react'
import Navbar from './components/Navbar'
import BottomUpParsing from './pages/BottomUpParsing'
import Home from './pages/Home'
import RegexToDFA from './pages/RegexToDFA'

function App() {
  const [activePage, setActivePage] = useState('Home')

  return (
    <div>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'Home' && (
        <Home
          onOpenParsing={() => setActivePage('Bottom-Up Parsing')}
          onOpenRegex={() => setActivePage('Regular Expression to DFA')}
        />
      )}
      {activePage === 'Bottom-Up Parsing' && <BottomUpParsing />}
      {activePage === 'Regular Expression to DFA' && <RegexToDFA />}
    </div>
  )
}

export default App
