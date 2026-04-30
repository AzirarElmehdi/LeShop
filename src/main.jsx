import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
import { CartProvider } from './context/CartContext.jsx'
import { ShopProvider } from './context/ShopContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ShopProvider>
      <CartProvider> 
        <App />      
      </CartProvider>
    </ShopProvider>
  </React.StrictMode>,
)