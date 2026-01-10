import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Contenido from './pages/Contenido';
import Dashboard from './pages/Dashboard';
import ExamenVista from './pages/ExamenVista';
import Examenes from './pages/Examenes';
import Progreso from './pages/Progreso';

function App() {
  return (
    <BrowserRouter>
       
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/contenido/:idSubtema" element={<Contenido />} />
          <Route path="/examenes" element={<Examenes />} />
          <Route path="/examen/:idExamen" element={<ExamenVista />} />
          <Route path="/progreso" element={<Progreso />} />

         {/* Redireccionar cualquier ruta desconocida al login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;