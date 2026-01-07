import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GuiaService } from '../services/GuiaService';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Contenido() {
  const { idSubtema } = useParams();
  const navigate = useNavigate();
  
  // Estado para el contenido actual
  const [subtemaActual, setSubtemaActual] = useState(null);
  
  // Estado para el Sidebar (Lista completa de temas/subtemas)
  const [temario, setTemario] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const cargarDatosCompletos = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener el detalle del subtema actual
      const subtemaData = await GuiaService.obtenerDetalleSubtema(idSubtema);
      setSubtemaActual(subtemaData);

      // 2. Obtener la estructura completa de la asignatura para el Sidebar
      // (Solo si aún no la tenemos o si cambiamos de asignatura)
      if (temario.length === 0) {
        const temas = await GuiaService.obtenerTemasPorAsignatura(subtemaData.tema.asignatura.idAsignatura);
        
        // Enriquecer cada tema con sus subtemas
        const temarioCompleto = await Promise.all(temas.map(async (tema) => {
          const subtemas = await GuiaService.obtenerSubtemasPorTema(tema.idTema);
          return { ...tema, subtemas };
        }));
        
        setTemario(temarioCompleto);
      }

    } catch (error) {
      console.error("Error cargando contenido", error);
    } finally {
      setLoading(false);
    }
  };
    cargarDatosCompletos();
  }, [idSubtema, temario.length]);

  const renderHTML = (html) => ({ __html: html });

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('embed')) return url;
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading && !subtemaActual) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="vh-100 d-flex flex-column font-poppins bg-light">
      <Navbar />
      
      {/* CONTENEDOR PRINCIPAL FLEX (Sidebar + Contenido) */}
      <div className="lms-container">
        
        {/* 1. SIDEBAR DE NAVEGACIÓN */}
        <aside className="lms-sidebar">
          <div className="p-3 border-bottom bg-white sticky-top">
            <h6 className="fw-bold text-dark mb-1">
              <i className="fas fa-book-reader me-2 text-primary"></i>
              {subtemaActual?.tema?.asignatura?.nombre || 'Temario'}
            </h6>
            <small className="text-muted">Índice de Contenidos</small>
          </div>

          <div className="sidebar-content">
            {temario.map((tema) => (
              <div key={tema.idTema}>
                {/* Título del Tema */}
                <div className="sidebar-theme-header">
                  {tema.nombre}
                </div>
                
                {/* Lista de Subtemas */}
                <div className="d-flex flex-column">
                  {tema.subtemas?.map((sub) => (
                    <div 
                      key={sub.idSubtema}
                      onClick={() => navigate(`/dashboard/contenido/${sub.idSubtema}`)}
                      className={`sidebar-subitem ${parseInt(idSubtema) === sub.idSubtema ? 'active' : ''}`}
                    >
                      <i className={`fas fa-circle me-2 ${parseInt(idSubtema) === sub.idSubtema ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '6px' }}></i>
                      {sub.nombre}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 2. AREA DE CONTENIDO PRINCIPAL */}
        <main className="lms-content">
          <div className="container-fluid px-lg-5">
            <div className="row justify-content-center">
              <div className="col-xl-9 col-lg-10">
                
                {/* Breadcrumbs */}
                <div className="mb-4">
                  <Breadcrumbs 
                    items={[
                      { label: 'Guía Digital', path: '/dashboard' },
                      { label: subtemaActual?.tema?.nombre || 'Módulo', path: null },
                      { label: subtemaActual?.nombre, path: null }
                    ]} 
                  />
                </div>

                {/* Título Principal */}
                <header className="mb-5 border-bottom pb-4">
                  <h1 className="display-5 fw-bold text-dark mb-3">{subtemaActual?.nombre}</h1>
                  <div className="d-flex align-items-center gap-3 text-muted">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill">
                      <i className="fas fa-bookmark me-1"></i> Lección
                    </span>
                    <span><i className="far fa-clock me-1"></i> Tiempo de lectura: 10 min</span>
                  </div>
                </header>

                {/* Video Player (Si existe) */}
                {subtemaActual?.urlVideo && (
                  <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-5">
                    <div className="ratio ratio-16x9">
                      <iframe 
                        src={getEmbedUrl(subtemaActual.urlVideo)} 
                        title={subtemaActual.nombre}
                        allowFullScreen 
                        className="rounded-top"
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Cuerpo del Artículo (HTML Rico) */}
                <article className="bg-white p-5 rounded-4 shadow-sm border border-light mb-5 content-wrapper">
                  <div 
                    className="rich-text-content"
                    dangerouslySetInnerHTML={renderHTML(subtemaActual?.contenido)} 
                  />
                </article>

                {/* Pie de Página de la Lección */}
                <div className="text-center pb-5 text-muted small">
                   <button 
                    onClick={() => navigate('/dashboard')} 
                    className="btn btn-outline-secondary rounded-pill px-4 fw-medium"
                   >
                <i className="fas fa-arrow-left me-2"></i> Volver a la Guía Digital
              </button>
                </div>

              </div>
            </div>
          </div>
        </main>

      </div>

      <style>{`
        .font-poppins { font-family: 'Poppins', sans-serif; }
        
        .content-wrapper {
          position: relative;
        }

        /* Estilos para tu HTML de base de datos */
        .rich-text-content {
          color: #374151; /* Gris oscuro suave para lectura */
          line-height: 1.8;
          font-size: 1.1rem;
        }

        .rich-text-content h1, 
        .rich-text-content h2, 
        .rich-text-content h3 {
          color: #1e3c72;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        
        .rich-text-content h2 { font-size: 1.75rem; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.5rem; }
        .rich-text-content h3 { font-size: 1.4rem; }

        .rich-text-content p { margin-bottom: 1.5rem; }

        .rich-text-content ul, .rich-text-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .rich-text-content li { margin-bottom: 0.5rem; }

        .rich-text-content strong { color: #111827; font-weight: 700; }

        .rich-text-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 2rem 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .rich-text-content blockquote {
          border-left: 4px solid #2a5298;
          background: #eff6ff;
          padding: 1rem 1.5rem;
          border-radius: 0 8px 8px 0;
          color: #1e40af;
          font-style: italic;
          margin: 2rem 0;
        }

        .hover-elevate:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(30, 60, 114, 0.2); }
      `}</style>
    </div>
  );
}