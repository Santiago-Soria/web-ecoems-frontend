import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamenService } from '../services/ExamenService';
import Navbar from '../components/Navbar';

export default function Examenes() {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarExamenes();
  }, []);

  const cargarExamenes = async () => {
    try {
      const data = await ExamenService.listar();
      setExamenes(data);
    } catch (error) {
      console.error("Error al cargar exámenes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = (idExamen) => {
    navigate(`/examen/${idExamen}`);
  };

  return (
    <div className="bg-light min-vh-100 font-poppins">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-white border-bottom shadow-sm mb-5">
        <div className="container-xxl px-4 px-lg-5 py-5">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-success bg-opacity-10 text-success mb-2 px-3 py-2 rounded-pill fw-bold">
                Evaluación
              </span>
              <h1 className="display-6 fw-bold text-dark mb-2">Exámenes Simulacro</h1>
              <p className="lead text-muted mb-0">
                Pon a prueba tus conocimientos. Selecciona un examen para comenzar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Exámenes */}
      <div className="container-xxl px-4 px-lg-5 pb-5">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <div className="dashboard-grid">
            {examenes.map((examen) => (
              <div key={examen.idExamen} className="grid-item">
                <div className="card h-100 border-0 shadow-sm exam-card">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="icon-box-exam">
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <div>
                        <h4 className="fw-bold text-dark mb-1">{examen.nombre}</h4>
                        <small className="text-muted">Simulador Oficial</small>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
                        <span><i className="far fa-clock me-1"></i> ~45 min</span>
                        <span><i className="fas fa-list-ol me-1"></i> Preguntas múltiples</span>
                      </div>
                      <button 
                        onClick={() => handleIniciar(examen.idExamen)}
                        className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm btn-hover-effect"
                      >
                        Iniciar Examen <i className="fas fa-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {examenes.length === 0 && !loading && (
              <div className="col-12 text-center text-muted">
                No hay exámenes disponibles por el momento.
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .font-poppins { font-family: 'Poppins', sans-serif; }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .exam-card {
          border-radius: 16px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .exam-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
        }

        .icon-box-exam {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);
          color: #2e7d32;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(30, 60, 114, 0.25);
        }
      `}</style>
    </div>
  );
}