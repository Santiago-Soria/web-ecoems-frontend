import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamenService } from '../services/ExamenService';
import Navbar from '../components/Navbar';

export default function Examenes() {
  const [examenes, setExamenes] = useState([]);
  const [examenesFiltrados, setExamenesFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    cargarExamenesYResultados();
  }, []);

  useEffect(() => {
    const filtrados = examenes.filter(ex => 
      ex.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setExamenesFiltrados(filtrados);
  }, [busqueda, examenes]);

  const cargarExamenesYResultados = async () => {
    try {
      const [dataExamenes, dataResultados] = await Promise.all([
        ExamenService.listar(),
        ExamenService.obtenerResultadosPorUsuario(usuario.idUsuario)
      ]);
      
      const mapeados = dataExamenes.map(examen => {
        const intentos = dataResultados?.filter(res => 
          String(res.examen?.idExamen) === String(examen.idExamen)
        );
        const mejorIntento = intentos?.length > 0 
          ? intentos.sort((a, b) => b.scoreTotal - a.scoreTotal)[0] 
          : null;

        return {
          ...examen,
          mejorCalificacion: mejorIntento ? mejorIntento.scoreTotal : null,
          // Si tu backend devuelve la lista de preguntas, usamos .length
          // Si devuelve un campo contador, usamos ese campo
          totalReactivos: examen.cantidadPreguntas || (examen.preguntas ? examen.preguntas.length : 0)
        };
      });

      setExamenes(mapeados);
      setExamenesFiltrados(mapeados);
    } catch (error) {
      console.error("Error al cargar exámenes", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 font-poppins">
      <Navbar />
      
      {/* HERO SECTION - Ajustado al estilo Dashboard */}
      <div className="bg-white border-bottom py-5 mb-5 shadow-sm">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-success bg-opacity-10 text-success mb-2 px-3 py-2 rounded-pill fw-bold">
                Simuladores Oficiales
              </span>
              <h1 className="display-5 fw-bold text-dark mb-3">
                Prepárate para el <span style={{ color: '#1e3c72' }}>Éxito</span>
              </h1>
              <p className="lead text-muted mb-4" style={{ maxWidth: '600px' }}>
                Mide tus conocimientos con nuestros simulacros actualizados al temario 2026.
              </p>
              
              <div className="position-relative" style={{ maxWidth: '500px' }}>
                <span className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control form-control-lg border-0 shadow-sm ps-5 rounded-pill" 
                  style={{ fontSize: '1rem', background: '#f8f9fa' }}
                  placeholder="Buscar simulador por nombre..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-lg-4 text-end d-none d-lg-block">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3426/3426653.png" 
                alt="Exámenes" 
                width="130" 
                style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div className="dashboard-grid">
            {examenesFiltrados.map((examen) => (
              <div key={examen.idExamen} className="grid-item">
                <div className="card asig-card h-100 border-0 shadow-sm overflow-hidden">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className={`icon-box-exam ${examen.mejorCalificacion !== null ? 'done' : ''}`}>
                        <i className={`fas ${examen.mejorCalificacion !== null ? 'fa-star' : 'fa-file-alt'}`}></i>
                      </div>
                      <div>
                        <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.15rem' }}>{examen.nombre}</h4>
                        <small className={`fw-bold ${examen.mejorCalificacion !== null ? 'text-success' : 'text-primary'}`}>
                          {examen.mejorCalificacion !== null ? 'Completado' : 'Disponible'}
                        </small>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between mb-3 p-2 bg-light rounded-3">
                        
                        <div className="text-center flex-fill">
                          <small className="d-block text-muted smaller fw-bold">MEJOR NOTA</small>
                          <span className="fw-bold text-dark">{examen.mejorCalificacion ?? '--'}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/examen/${examen.idExamen}`)}
                        className={`btn w-100 rounded-pill fw-bold py-2 shadow-sm ${
                          examen.mejorCalificacion !== null ? 'btn-outline-primary' : 'btn-primary'
                        }`}
                      >
                        {examen.mejorCalificacion !== null ? 'Reintentar' : 'Iniciar Examen'} 
                        <i className="fas fa-chevron-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .asig-card {
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
        }
        .asig-card:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        .icon-box-exam {
          width: 52px; height: 52px; background: #eef2ff;
          color: #1e3c72; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        }
        .icon-box-exam.done { background: #fff9c4; color: #fbc02d; }
        .smaller { font-size: 0.65rem; letter-spacing: 0.5px; }
      `}</style>
    </div>
  );
}