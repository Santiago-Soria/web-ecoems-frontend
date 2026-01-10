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
  const [puntajePrevio, setPuntajePrevio] = useState(null);

  const [estadoVista, setEstadoVista] = useState('BIENVENIDA'); 
  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [resultadoFinal, setResultadoFinal] = useState(null);

  useEffect(() => {
    const cargarInformacion = async () => {
      try {
        setLoading(true);
        // Llamadas paralelas para mayor velocidad
        const [dataQs, dataPrev] = await Promise.all([
          ExamenService.obtenerPreguntas(idExamen),
          ExamenService.obtenerResultadoUsuario(usuario.idUsuario, idExamen)
        ]);
        
        setPreguntas(dataQs);
        if (dataPrev) setPuntajePrevio(dataPrev.scoreTotal);
      } catch (error) {
        console.error("Error cargando el simulador", error);
      } finally {
        setLoading(false);
      }
    };
    cargarInformacion();
  }, [idExamen, usuario.idUsuario]);

  const handleSeleccionarOpcion = (opcion) => {
    setRespuestas({ ...respuestas, [preguntas[indiceActual].idPregunta]: opcion });
  };

  const handleFinalizar = async () => {
    const result = await Swal.fire({
      title: '¿Confirmas el envío?',
      text: "Se guardará tu progreso académico.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      confirmButtonColor: '#1e3c72'
    });

    if (!result.isConfirmed) return;

    let aciertos = 0;
    preguntas.forEach(p => {
      if (respuestas[p.idPregunta]?.toLowerCase() === p.opcionCorrecta?.toLowerCase()) {
        aciertos++;
      }
    });

    const score = parseFloat(((aciertos / preguntas.length) * 10).toFixed(2));

    try {
      await ExamenService.guardarResultado({
        idUsuario: usuario.idUsuario,
        idExamen: idExamen,
        scoreTotal: score
      });
      setResultadoFinal({ score, aciertos, total: preguntas.length });
      setEstadoVista('RESULTADOS');
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la calificación', 'error');
    }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-white"><div className="spinner-border text-primary"></div></div>;

  // Pantalla de Examen sin preguntas cargadas
  if (preguntas.length === 0) return (
    <div className="vh-100 d-flex flex-column font-poppins">
      <Navbar />
      <div className="container flex-grow-1 d-flex align-items-center justify-content-center text-center">
        <div>
          <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
          <h3>Sin preguntas disponibles</h3>
          <p className="text-muted">Aún no se han cargado reactivos en la base de datos para este examen.</p>
          <button onClick={() => navigate('/examenes')} className="btn btn-primary rounded-pill px-4 mt-2">Regresar al menú</button>
        </div>
      </div>
    </div>
  );

  // --- VISTA: BIENVENIDA ---
  if (estadoVista === 'BIENVENIDA') {
    return (
      <div className="vh-100 d-flex flex-column font-poppins bg-light">
        <Navbar />
        <div className="container flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="card border-0 shadow-lg rounded-4 p-5 text-center" style={{ maxWidth: '550px' }}>
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle mx-auto mb-4" style={{ width: '70px', height: '70px', display: 'grid', placeItems: 'center' }}>
              <i className="fas fa-edit fa-2x"></i>
            </div>
            <h3 className="fw-bold text-dark">Simulador de Ingreso</h3>
            <p className="text-muted px-md-3">Has seleccionado un examen de <b>{preguntas.length} preguntas</b>. ¿Deseas comenzar la evaluación?</p>

            {puntajePrevio !== null && (
              <div className="alert alert-primary border-0 rounded-4 mb-4">
                <i className="fas fa-star me-2 text-warning"></i>
                Último intento: <strong>{puntajePrevio}/10</strong>
              </div>
            )}

            <div className="d-grid gap-3">
              <button onClick={() => setEstadoVista('EXAMEN')} className="btn btn-primary btn-lg rounded-pill py-3 fw-bold shadow-sm">
                {puntajePrevio !== null ? 'Volver a intentar' : 'Comenzar ahora'}
              </button>
              <button onClick={() => navigate('/examenes')} className="btn btn-outline-secondary rounded-pill py-2">
                Tal vez después
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA: RESULTADOS ---
  if (estadoVista === 'RESULTADOS') {
    const paso = resultadoFinal.score >= 6;
    return (
      <div className="vh-100 d-flex flex-column font-poppins bg-white">
        <Navbar />
        <div className="container flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="card border-0 shadow-lg rounded-4 p-5 text-center" style={{ maxWidth: '500px' }}>
            <h2 className="fw-bold mb-4">Resumen del Simulacro</h2>
            <div className={`display-1 fw-black mb-2 ${paso ? 'text-success' : 'text-danger'}`}>{resultadoFinal.score}</div>
            <div className="h5 text-muted mb-4">Puntuación obtenida</div>
            
            <div className="row mb-4 border rounded-4 p-3 bg-light g-0">
               <div className="col-6 border-end">
                 <div className="fw-bold text-dark h4 mb-0">{resultadoFinal.aciertos}</div>
                 <small className="text-muted text-uppercase fw-bold" style={{fontSize: '10px'}}>Aciertos</small>
               </div>
               <div className="col-6">
                 <div className="fw-bold text-dark h4 mb-0">{resultadoFinal.total - resultadoFinal.aciertos}</div>
                 <small className="text-muted text-uppercase fw-bold" style={{fontSize: '10px'}}>Errores</small>
               </div>
            </div>

            <div className="d-grid gap-3">
              <button onClick={() => setEstadoVista('REVISION')} className="btn btn-primary btn-lg rounded-pill py-3 fw-bold">Ver Revisión Detallada</button>
              <button onClick={() => navigate('/examenes')} className="btn btn-outline-dark rounded-pill py-2">Volver a mis exámenes</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA: REVISIÓN ---
  if (estadoVista === 'REVISION') {
    return (
      <div className="min-vh-100 d-flex flex-column font-poppins bg-light">
        <Navbar />
        <div className="container py-5">
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <h3 className="fw-bold m-0 text-dark">Retroalimentación</h3>
            <button onClick={() => navigate('/examenes')} className="btn btn-dark rounded-pill px-4">Salir</button>
          </div>
          <div className="row g-4">
            {preguntas.map((p, index) => {
              const miRespuesta = respuestas[p.idPregunta];
              const esCorrecta = miRespuesta?.toLowerCase() === p.opcionCorrecta?.toLowerCase();
              return (
                <div key={p.idPregunta} className="col-12">
                  <div className={`card border-0 shadow-sm rounded-4 ${esCorrecta ? 'border-start border-success border-5' : 'border-start border-danger border-5'}`}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between mb-2">
                        <h6 className="fw-bold text-muted small">Reactivo {index + 1}</h6>
                        <span className={`badge ${esCorrecta ? 'bg-success' : 'bg-danger'}`}>{esCorrecta ? 'Acierto' : 'Error'}</span>
                      </div>
                      <h5 className="fw-bold mb-4">{p.texto}</h5>
                      <div className="row g-2">
                        {['A', 'B', 'C', 'D'].map(l => {
                          const esCorrectaDB = l.toLowerCase() === p.opcionCorrecta?.toLowerCase();
                          const esMía = l.toLowerCase() === miRespuesta?.toLowerCase();
                          
                          let bg = "bg-light text-dark";
                          if (esCorrectaDB) bg = "bg-success text-white shadow-sm";
                          else if (esMía && !esCorrecta) bg = "bg-danger text-white shadow-sm";

                          return (
                            <div key={l} className={`col-md-6 p-3 rounded-3 ${bg} d-flex align-items-center gap-3 transition-all`}>
                              <span className="fw-black">{l})</span> {p[`opcion${l}`]}
                              {esCorrectaDB && <i className="fas fa-check-circle ms-auto"></i>}
                              {esMía && !esCorrecta && <i className="fas fa-times-circle ms-auto"></i>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA: EVALUACIÓN ACTIVA ---
  const pActual = preguntas[indiceActual];
  const seleccion = respuestas[pActual.idPregunta];

  return (
    <div className="vh-100 d-flex flex-column font-poppins bg-light">
      <Navbar />
      <div className="lms-container">
        <aside className="lms-sidebar bg-white border-end shadow-sm">
          <div className="p-4 border-bottom">
            <h6 className="fw-bold mb-3 text-dark">Mi Progreso</h6>
            <div className="progress" style={{ height: '10px', borderRadius: '10px' }}>
              <div className="progress-bar bg-primary progress-bar-striped progress-bar-animated" style={{ width: `${(Object.keys(respuestas).length / preguntas.length) * 100}%` }}></div>
            </div>
            <small className="text-muted mt-2 d-block text-center">{Object.keys(respuestas).length} de {preguntas.length} respondidas</small>
          </div>
          <div className="p-3 grid-indices">
            {preguntas.map((p, i) => (
              <button 
                key={p.idPregunta} 
                onClick={() => setIndiceActual(i)} 
                className={`btn-indice ${indiceActual === i ? 'active' : ''} ${respuestas[p.idPregunta] ? 'done' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </aside>

        <main className="lms-content">
          <div className="container py-5 d-flex flex-column align-items-center justify-content-center h-100">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 w-100" style={{ maxWidth: '850px' }}>
              <span className="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2 rounded-pill fw-bold">
                Pregunta {indiceActual + 1} de {preguntas.length}
              </span>
              <h4 className="fw-bold text-dark mb-5 lh-base" style={{fontSize: '1.4rem'}}>{pActual.texto}</h4>
              
              <div className="d-grid gap-3">
                {['A', 'B', 'C', 'D'].map(l => (
                  <div 
                    key={l} 
                    onClick={() => handleSeleccionarOpcion(l)} 
                    className={`option-item p-3 border-2 rounded-4 d-flex align-items-center gap-3 transition-all ${seleccion === l ? 'selected' : 'hover-effect'}`}
                  >
                    <div className="option-circle">{l}</div>
                    <span className="fw-medium">{pActual[`opcion${l}`]}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                <button disabled={indiceActual === 0} onClick={() => setIndiceActual(indiceActual - 1)} className="btn btn-outline-secondary rounded-pill px-4 fw-bold">
                  <i className="fas fa-arrow-left me-2"></i> Anterior
                </button>
                {indiceActual === preguntas.length - 1
                  ? <button onClick={handleFinalizar} className="btn btn-success rounded-pill px-5 fw-bold shadow-sm">Terminar Examen <i className="fas fa-check-double ms-2"></i></button>
                  : <button onClick={() => setIndiceActual(indiceActual + 1)} className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">Siguiente <i className="fas fa-arrow-right ms-2"></i></button>
                }
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .lms-container { display: flex; height: calc(100vh - 64px); overflow: hidden; }
        .lms-sidebar { width: 320px; overflow-y: auto; z-index: 10; }
        .lms-content { flex: 1; overflow-y: auto; background: #f0f2f5; }
        .grid-indices { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .btn-indice { width: 44px; height: 44px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: bold; transition: 0.2s; }
        .btn-indice.active { background: #1e3c72; color: white; border-color: #1e3c72; transform: scale(1.1); box-shadow: 0 4px 12px rgba(30,60,114,0.3); }
        .btn-indice.done { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
        
        .option-item { border: 2px solid #e2e8f0; cursor: pointer; }
        .option-item.hover-effect:hover { border-color: #cbd5e1; background: #f8fafc; }
        .option-item.selected { border-color: #1e3c72; background: #eff6ff; }
        .option-circle { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-weight: bold; background: white; color: #64748b; }
        .selected .option-circle { background: #1e3c72; color: white; border-color: #1e3c72; }
      `}</style>
    </div>
  );
}