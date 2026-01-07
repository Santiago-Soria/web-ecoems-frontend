import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExamenService } from '../services/ExamenService';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

export default function ExamenVista() {
  const { idExamen } = useParams();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestas, setRespuestas] = useState({}); // Mapa: { idPregunta: 'A' }

  useEffect(() => {
  const cargarExamen = async () => {
    try {
      const data = await ExamenService.obtenerPreguntas(idExamen);
      setPreguntas(data);
    } catch (error) {
      console.error("Error cargando examen", error);
      Swal.fire('Error', 'No se pudieron cargar las preguntas', 'error');
    } finally {
      setLoading(false);
    }
  };
    cargarExamen();
  }, [idExamen]);



  const handleSeleccionarOpcion = (opcion) => {
    const preguntaActual = preguntas[indiceActual];
    setRespuestas({
      ...respuestas,
      [preguntaActual.idPregunta]: opcion
    });
  };

  const handleNavegacion = (direccion) => {
    if (direccion === 'prev' && indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    } else if (direccion === 'next' && indiceActual < preguntas.length - 1) {
      setIndiceActual(indiceActual + 1);
    }
  };

  const handleFinalizar = async () => {
    // Confirmación
    const result = await Swal.fire({
      title: '¿Terminar examen?',
      text: "No podrás cambiar tus respuestas después.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e3c72',
      confirmButtonText: 'Sí, calificar',
      cancelButtonText: 'Revisar'
    });

    if (!result.isConfirmed) return;

    // Calcular Puntaje
    let aciertos = 0;
    preguntas.forEach(p => {
      // Comparamos respuesta usuario vs correcta (normalizando a mayúsculas/minúsculas por si acaso)
      const respuestaUser = respuestas[p.idPregunta]?.toUpperCase();
      const correcta = p.opcionCorrecta?.toUpperCase();
      
      if (respuestaUser === correcta) {
        aciertos++;
      }
    });

    // Escala de 0 a 10
    const calificacionFinal = preguntas.length > 0 ? (aciertos / preguntas.length) * 10 : 0;
    const scoreFormatted = parseFloat(calificacionFinal.toFixed(2));

    try {
      // Guardar en Backend
      await ExamenService.guardarResultado({
        idUsuario: usuario.idUsuario,
        idExamen: idExamen,
        scoreTotal: scoreFormatted
      });

      // Mostrar Resultado
      await Swal.fire({
        title: `Calificación: ${scoreFormatted}/10`,
        html: `Tuviste <b>${aciertos}</b> aciertos de <b>${preguntas.length}</b> preguntas.`,
        icon: scoreFormatted >= 6 ? 'success' : 'error',
        confirmButtonText: 'Volver a Exámenes'
      });

      navigate('/examenes');

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema al guardar tu calificación', 'error');
    }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary"></div></div>;
  if (preguntas.length === 0) return <div className="p-5 text-center">Este examen no tiene preguntas aún.</div>;

  const preguntaActual = preguntas[indiceActual];
  const opcionSeleccionada = respuestas[preguntaActual.idPregunta];

  return (
    <div className="vh-100 d-flex flex-column font-poppins bg-light">
      <Navbar />

      <div className="lms-container">
        
        {/* SIDEBAR: NAVEGADOR DE PREGUNTAS */}
        <aside className="lms-sidebar">
          <div className="p-3 border-bottom bg-white sticky-top">
            <h6 className="fw-bold text-dark mb-1">Navegación</h6>
            <div className="progress" style={{ height: '6px' }}>
              <div 
                className="progress-bar bg-primary" 
                role="progressbar" 
                style={{ width: `${(Object.keys(respuestas).length / preguntas.length) * 100}%` }}
              ></div>
            </div>
            <small className="text-muted mt-1 d-block">
              {Object.keys(respuestas).length} de {preguntas.length} respondidas
            </small>
          </div>

          <div className="p-3">
            <div className="d-grid gap-2">
              {preguntas.map((p, index) => (
                <button
                  key={p.idPregunta}
                  onClick={() => setIndiceActual(index)}
                  className={`btn text-start d-flex justify-content-between align-items-center px-3 py-2 rounded-3 border-0 transition-all ${
                    index === indiceActual 
                      ? 'bg-primary text-white shadow-sm' 
                      : respuestas[p.idPregunta] 
                        ? 'bg-success bg-opacity-10 text-success' 
                        : 'bg-white text-secondary hover-bg-gray'
                  }`}
                >
                  <span className="fw-medium">Pregunta {index + 1}</span>
                  {respuestas[p.idPregunta] && (
                    <i className={`fas fa-check-circle ${index === indiceActual ? 'text-white' : 'text-success'}`}></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* PANEL PRINCIPAL: PREGUNTA */}
        <main className="lms-content d-flex flex-column">
          <div className="container-fluid px-lg-5 flex-grow-1 d-flex flex-column justify-content-center">
            
            <div className="row justify-content-center w-100">
              <div className="col-xl-9 col-lg-10">
                
                {/* Tarjeta de Pregunta */}
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                  <div className="card-header bg-white border-0 pt-4 px-4 px-md-5">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill mb-3">
                      Pregunta {indiceActual + 1}
                    </span>
                    <h4 className="fw-bold text-dark lh-base">
                      {preguntaActual.texto}
                    </h4>
                  </div>
                  
                  <div className="card-body p-4 p-md-5 pt-2">
                    <div className="d-grid gap-3">
                      {['A', 'B', 'C', 'D'].map((letra) => {
                        const textoOpcion = preguntaActual[`opcion${letra}`]; // opcionA, opcionB...
                        const isSelected = opcionSeleccionada === letra;
                        
                        return (
                          <div 
                            key={letra}
                            onClick={() => handleSeleccionarOpcion(letra)}
                            className={`option-card p-3 rounded-3 border cursor-pointer d-flex align-items-center gap-3 transition-all ${
                              isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light-subtle hover-border-primary'
                            }`}
                          >
                            <div className={`option-circle rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                              isSelected ? 'bg-primary text-white' : 'bg-white text-secondary border'
                            }`} style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                              {letra}
                            </div>
                            <span className={`fw-medium ${isSelected ? 'text-primary' : 'text-dark'}`}>
                              {textoOpcion}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="d-flex justify-content-between align-items-center mt-4 pb-5">
                  <button 
                    onClick={() => handleNavegacion('prev')}
                    disabled={indiceActual === 0}
                    className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-medium"
                  >
                    <i className="fas fa-arrow-left me-2"></i> Anterior
                  </button>

                  {indiceActual === preguntas.length - 1 ? (
                    <button 
                      onClick={handleFinalizar}
                      className="btn btn-success rounded-pill px-5 py-2 fw-bold shadow-sm"
                    >
                      Finalizar Examen <i className="fas fa-flag-checkered ms-2"></i>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleNavegacion('next')}
                      className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm"
                    >
                      Siguiente <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>

      <style>{`
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .hover-bg-gray:hover { background-color: #f8f9fa; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.2s ease; }
        
        .option-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .hover-border-primary:hover {
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
}