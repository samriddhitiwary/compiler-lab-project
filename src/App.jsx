import { useState } from 'react'
import Navbar from './components/Navbar'
import BottomUpParsing from './pages/BottomUpParsing'
import Home from './pages/Home'

function App() {
  const [activePage, setActivePage] = useState('Home')

  return (
    <div>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'Home' ? <Home onOpenModule={() => setActivePage('Bottom-Up Parsing')} /> : <BottomUpParsing />}
    </div>
  )
}

export default App
