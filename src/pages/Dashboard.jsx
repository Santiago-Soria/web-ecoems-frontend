import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuiaService } from '../services/GuiaService';
import Navbar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Dashboard() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAsignatura, setExpandedAsignatura] = useState(null);
  const [temasMap, setTemasMap] = useState({});
  const [subtemasMap, setSubtemasMap] = useState({});
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    cargarAsignaturas();
  }, []);

  const cargarAsignaturas = async () => {
    try {
      const data = await GuiaService.obtenerAsignaturas();
      setAsignaturas(data);
    } catch (error) {
      console.error("Error cargando asignaturas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAsignatura = async (idAsignatura) => {
    if (expandedAsignatura === idAsignatura) {
      setExpandedAsignatura(null);
      return;
    }
    setExpandedAsignatura(idAsignatura);
    
    if (!temasMap[idAsignatura]) {
      try {
        const temas = await GuiaService.obtenerTemasPorAsignatura(idAsignatura);
        setTemasMap(prev => ({ ...prev, [idAsignatura]: temas }));
        temas.forEach(t => cargarSubtemas(t.idTema));
      } catch (error) {
        console.error("Error cargando temas", error);
      }
    }
  };

  const cargarSubtemas = async (idTema) => {
    if (!subtemasMap[idTema]) {
      try {
        const subtemas = await GuiaService.obtenerSubtemasPorTema(idTema);
        setSubtemasMap(prev => ({ ...prev, [idTema]: subtemas }));
      } catch (error) {
        console.error("Error cargando subtemas", error);
      }
    }
  };

  return (
    <div className="bg-light min-vh-100 font-poppins">
      <Navbar />
      
      {/* HERO SECTION */}
      <div className="bg-white border-bottom py-5 mb-5 shadow-sm">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-2 rounded-pill fw-bold">
                Tu ruta de aprendizaje
              </span>
              <h1 className="display-5 fw-bold text-dark mb-3">
                ¡Hola, <span style={{ color: '#1e3c72' }}>{usuario?.nombre || 'Estudiante'}</span>!
              </h1>
              <p className="lead text-muted mb-0" style={{ maxWidth: '850px' }}>
                Selecciona una asignatura para desplegar los módulos de estudio:
              </p>
            </div>
            <div className="col-lg-4 text-end d-none d-lg-block">
              {/* Ilustración Decorativa */}
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3426/3426650.png" 
                alt="Study" 
                width="130" 
                style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE ASIGNATURAS */}
      <div className="container pb-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Cargando material...</p>
          </div>
        ) : (
          <div className="row g-4">
            {asignaturas.map((asig) => (
              <div key={asig.idAsignatura} className="col-lg-6">
                <div 
                  className={`card asig-card h-100 border-0 ${expandedAsignatura === asig.idAsignatura ? 'card-expanded' : ''}`}
                >
                  {/* HEADER TARJETA */}
                  <div 
                    className="card-body p-4 d-flex justify-content-between align-items-center clickable"
                    onClick={() => handleToggleAsignatura(asig.idAsignatura)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="icon-box shadow-sm">
                        <i className="fas fa-book text-primary fs-4"></i>
                      </div>
                      <div>
                        <h4 className="fw-bold text-dark mb-0">{asig.nombre}</h4>
                        <small className="text-muted">
                          {temasMap[asig.idAsignatura] ? `${temasMap[asig.idAsignatura].length} Módulos` : 'Toca para ver temas'}
                        </small>
                      </div>
                    </div>
                    <div className={`chevron-btn ${expandedAsignatura === asig.idAsignatura ? 'rotated' : ''}`}>
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>

                  {/* CONTENIDO ACORDEÓN */}
                  {expandedAsignatura === asig.idAsignatura && (
                    <div className="card-footer bg-white border-0 p-0 overflow-hidden fade-enter">
                      <div className="p-3 bg-light rounded-bottom-4">
                        {temasMap[asig.idAsignatura]?.length > 0 ? (
                          temasMap[asig.idAsignatura].map((tema) => (
                            <div key={tema.idTema} className="mb-3 bg-white rounded-3 p-3 shadow-sm border border-light theme-container">
                              <h6 className="fw-bold text-primary mb-3 ps-2 border-start border-4 border-primary">
                                {tema.nombre}
                              </h6>
                              
                              <div className="d-grid gap-2">
                                {subtemasMap[tema.idTema]?.length > 0 ? (
                                  subtemasMap[tema.idTema].map(sub => (
                                    <button
                                      key={sub.idSubtema}
                                      onClick={() => navigate(`/dashboard/contenido/${sub.idSubtema}`)}
                                      className="btn btn-light text-start d-flex justify-content-between align-items-center subtheme-btn"
                                    >
                                      <span className="text-truncate me-2">- {sub.nombre}</span>
                                      <i className="fas fa-play-circle text-success opacity-75"></i>
                                    </button>
                                  ))
                                ) : (
                                  <div className="text-center py-2 text-muted small">
                                    <i className="fas fa-spinner fa-spin me-2"></i> Cargando...
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-3 text-muted">No hay temas disponibles.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .asig-card {
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .asig-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
        .card-expanded {
          box-shadow: 0 12px 30px rgba(30, 60, 114, 0.1);
          border: 1px solid rgba(30, 60, 114, 0.1) !important;
        }
        .clickable { cursor: pointer; }
        
        .icon-box {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #e3f2fd, #ffffff);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        
        .chevron-btn {
          width: 32px; height: 32px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #adb5bd;
          transition: all 0.3s ease;
        }
        .chevron-btn.rotated {
          transform: rotate(90deg);
          background: #1e3c72;
          color: white;
        }
        
        .fade-enter {
          animation: slideDown 0.3s ease-out forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .subtheme-btn {
          border: 1px solid #f1f3f5;
          transition: all 0.2s;
        }
        .subtheme-btn:hover {
          background-color: #f1f3f5;
          border-color: #dee2e6;
          padding-left: 1.2rem;
        }
      `}</style>
    </div>
  );
}