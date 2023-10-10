import React from 'react'
import ReactDOM from 'react-dom'

import '@/styles/index.scss'

const App = () => {
  return (
    <div>
      Hello
    </div>
  )
}

const wrapper = document.getElementById('root')
ReactDOM.render(<App />, wrapper)
