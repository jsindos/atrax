import React from 'react'
import ReactDOM from 'react-dom'

import '@/styles/index.css'
import { Button } from './components/ui/button'

const App = () => {
  return (
    <div>
      <Button>
        kafhkajh
        </Button>
    </div>
  )
}

const wrapper = document.getElementById('root')
ReactDOM.render(<App />, wrapper)
