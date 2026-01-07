import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "¿Estás seguro que deseas salir?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e3c72',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuario');
        navigate('/');
      }
    });
  };

  const isActive = (path) => location.pathname.startsWith(path) ? 'active-link' : '';

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (!usuario) return 'U';
    return `${usuario.nombre.charAt(0)}${usuario.apPaterno.charAt(0)}`.toUpperCase();
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-white" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '0.8rem 1.5rem', zIndex: 1000 }}>
      <div className="container-fluid">
        {/* LOGO */}
        <Link className="navbar-brand d-flex align-items-center" to="/dashboard">
          <div 
            className="rounded-circle d-flex justify-content-center align-items-center me-2 logo-icon"
          >
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3426/3426653.png" 
                alt="Study" 
                width="40" 
                style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} 
              />
          </div>
          <div className="d-flex flex-column" style={{ lineHeight: '1' }}>
            <span className="fw-bold" style={{ color: '#1e3c72', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
              Prepárate<span style={{ color: '#2a5298' }}>ECOEMS</span>
            </span>
          </div>
        </Link>

        {/* MÓVIL TOGGLER */}
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="fas fa-bars text-primary fs-4"></span>
        </button>

        {/* MENÚ CENTRADO */}
        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          {/* Espacio vacío a la izquierda para balancear si se quiere centrar perfectamente, o simplemente el menú */}
          <ul className="navbar-nav mx-auto align-items-center gap-2">
            <li className="nav-item">
              <Link className={`nav-link custom-nav-link ${isActive('/dashboard')}`} to="/dashboard">
                <i className="fas fa-book me-2"></i>Guía Digital
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link custom-nav-link ${isActive('/examenes')}`} to="/examenes">
                <i className="fas fa-laptop-code me-2"></i>Exámenes
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link custom-nav-link ${isActive('/progreso')}`} to="/progreso">
                <i className="fas fa-chart-pie me-2"></i>Mi Progreso
              </Link>
            </li>
          </ul>

          {/* PERFIL & LOGOUT A LA DERECHA */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            <div className="d-flex align-items-center gap-2 border-end pe-3 d-none d-lg-flex">
              <div className="user-avatar shadow-sm">
                {getInitials()}
              </div>
              <div className="d-flex flex-column text-end">
                <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{usuario?.nombre}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Estudiante</span>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="btn btn-logout rounded-pill px-3 py-2 fw-semibold"
              title="Cerrar Sesión"
            >
              <i className="fas fa-sign-out-alt"></i> 
              <span className="">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .logo-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          box-shadow: 0 4px 10px rgba(30, 60, 114, 0.25);
        }
        .custom-nav-link {
          color: #6c757d;
          font-weight: 500;
          padding: 0.6rem 1.2rem !important;
          border-radius: 50px;
          transition: all 0.3s ease;
        }
        .custom-nav-link:hover {
          color: #1e3c72;
          background-color: #f1f3f5;
          transform: translateY(-1px);
        }
        .active-link {
          color: #1e3c72 !important;
          background-color: #e8eaf6;
          font-weight: 600;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .user-avatar {
          width: 40px; height: 40px;
          background-color: #fff;
          border: 2px solid #e8eaf6;
          color: #1e3c72;
          font-weight: 700;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem;
        }
        .btn-logout {
          color: #dc3545;
          border: 1px solid #ffebee;
          background: #fff;
          transition: all 0.3s;
        }
        .btn-logout:hover {
          background-color: #dc3545;
          color: white;
          border-color: #dc3545;
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
        }
      `}</style>
    </nav>
  );
}