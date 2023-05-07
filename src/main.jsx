import React from 'react'
import ReactDOM from 'react-dom/client'
import Pagecheck from './Pagecheck'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <BrowserRouter>

    <Pagecheck />

  </BrowserRouter>
  // </React.StrictMode>
)
