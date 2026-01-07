import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apPaterno: '',
    apMaterno: '',
    correo: '',
    contrasena: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validación simple
    if (formData.contrasena.length < 6) {
      Swal.fire('Atención', 'La contraseña debe tener al menos 6 caracteres', 'warning');
      setLoading(false);
      return;
    }

    try {
      await axiosClient.post('/usuarios', formData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada con éxito!',
        text: 'Bienvenido a PrepárateECOEMS.',
        confirmButtonColor: '#1e3c72'
      });
      
      navigate('/'); 
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: 'El correo electrónico ya está en uso. Intenta iniciar sesión. ' + error,
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen">
      {/* PANEL IZQUIERDO: ARTE (Invertido visualmente para variar) */}
      <div className="left-pane" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
        <div className="left-content">
           <img 
              src="src\img\registro_ecoems.png" 
              alt="ECOEMS Cover" 
              className="hero-img"
              style={{ maxWidth: '400px' }}
           />
           <h2 className="fw-bold display-6 mt-4">Únete a PrepárateECOEMS</h2>
           <p className="lead opacity-75">
             Crea tu cuenta hoy y obtén acceso ilimitado a nuestros simuladores y material de estudio.
           </p>
        </div>
      </div>

      {/* PANEL DERECHO: FORMULARIO */}
      <div className="right-pane">
        <div className="auth-container" style={{ maxWidth: '500px' }}>
          <header>
            <h2 className="auth-title">Crear Cuenta</h2>
            <p className="auth-subtitle">Rellena el formulario para comenzar tu viaje</p>
          </header>
          
          <form onSubmit={handleRegistro} autoComplete="off">
            
            {/* Grid para Nombres y Apellidos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
               <div className="form-group">
                 <label className="form-label">Nombre(s)</label>
                 <input 
                   name="nombre" 
                   className="custom-input" 
                   placeholder="Ej. Santiago"
                   onChange={handleChange} 
                   required 
                 />
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Apellido Paterno</label>
                <input 
                  name="apPaterno" 
                  className="custom-input" 
                  placeholder="Ej. Soria"
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido Materno</label>
                <input 
                  name="apMaterno" 
                  className="custom-input" 
                  placeholder="Ej. Pérez"
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                name="correo" 
                className="custom-input" 
                placeholder="estudiante@escuela.mx"
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                name="contrasena" 
                className="custom-input" 
                placeholder="Mínimo 6 caracteres"
                onChange={handleChange} 
                required 
              />
            </div>

            <button type="submit" className="btn-custom-primary" disabled={loading}>
               {loading ? 'Creando cuenta...' : 'Registrarme Gratis'}
            </button>
          </form>

          <footer className="auth-footer">
            <p>¿Ya tienes una cuenta? <Link to="/" className="link-custom">Inicia sesión aquí</Link></p>
          </footer>
        </div>
      </div>
    </div>
  );
}