import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosClient.post('/usuarios/login', {
        correo,
        contrasena
      });

      localStorage.setItem('usuario', JSON.stringify(response.data));
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toast.fire({
        icon: 'success',
        title: `¡Bienvenido, ${response.data.nombre}!`
      });

      navigate('/dashboard'); 
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Credenciales Incorrectas',
        text: 'Por favor verifica tu correo y contraseña. ' + error,
        confirmButtonColor: '#1e3c72',
        confirmButtonText: 'Intentar de nuevo'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen">
      {/* PANEL IZQUIERDO: ARTE */}
      <div className="left-pane">
        <div className="left-content">
          <img 
            src="https://img.freepik.com/free-vector/online-tutorials-concept_52683-37480.jpg?w=740&t=st=1709669000~exp=1709669600~hmac=..." 
            alt="Ilustración Login" 
            className="hero-img"
          />
          <h1 className="fw-bold display-5 mb-3">Tu futuro comienza aquí</h1>
          <p className="lead" style={{ opacity: 0.9 }}>
            Accede a la mejor plataforma de preparación para el examen ECOEMS.
            Simulacros, guías y resultados al instante.
          </p>
        </div>
      </div>

      {/* PANEL DERECHO: FORMULARIO */}
      <div className="right-pane">
        <div className="auth-container">
          <header>
            <h2 className="auth-title">¡Bienvenido a PrepárateECOEMS!</h2>
            <p className="auth-subtitle">Ingresa tus datos para continuar</p>
          </header>

          <form onSubmit={handleLogin} autoComplete="off">
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="custom-input" 
                placeholder="nombre@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <div className="d-flex justify-content-between">
                <label className="form-label">Contraseña</label>
                <a href="#" className="link-custom" style={{fontSize: '0.85rem'}}>¿Olvidaste tu contraseña?</a>
              </div>
              <input 
                type="password" 
                className="custom-input"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn-custom-primary" disabled={loading}>
              {loading ? (
                <span><i className="fas fa-spinner fa-spin me-2"></i> Cargando...</span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <footer className="auth-footer">
            <p>¿Aún no tienes cuenta? <Link to="/registro" className="link-custom">Regístrate gratis</Link></p>
          </footer>
        </div>
      </div>
    </div>
  );
}