import { BrowserRouter, Routes, Route } from "react-router-dom"

import ActivoDetallePage from "./pages/activoDetallePage/ActivoDetallePage"
import Home from "./pages/home/Home"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Ruta para ver detalles y agregar propietarios */}
        <Route path="/activo/:id" element={<ActivoDetallePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
