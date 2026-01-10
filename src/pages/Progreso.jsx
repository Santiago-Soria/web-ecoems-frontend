import { useEffect, useState, useMemo } from 'react';
import { ExamenService } from '../services/ExamenService';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';

export default function MiProgreso() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await ExamenService.obtenerResultadosPorUsuario(usuario.idUsuario);
      setResultados(data || []);
    } catch (e) { 
      console.error("Error cargando progreso", e); 
    } finally { 
      setLoading(false); 
    }
  };

  const stats = useMemo(() => {
    if (!resultados.length) return null;
    
    const scores = resultados.map(r => r.scoreTotal);
    const promedio = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
    const nivelPreparacion = Math.min(100, Math.round(promedio * 10));

    const materiasMap = resultados.reduce((acc, curr) => {
      const name = curr.examen?.nombre || 'General';
      if (!acc[name]) acc[name] = { name, total: 0, count: 0 };
      acc[name].total += curr.scoreTotal;
      acc[name].count += 1;
      return acc;
    }, {});

    const chartMaterias = Object.values(materiasMap).map(m => {
      const prom = parseFloat((m.total / m.count).toFixed(1));
      return { name: m.name, prom, fill: prom >= 8 ? '#198754' : prom >= 6 ? '#0d6efd' : '#dc3545' };
    });

    const materiaFuerte = [...chartMaterias].sort((a, b) => b.prom - a.prom)[0];
    const materiaDebil = [...chartMaterias].sort((a, b) => a.prom - b.prom)[0];

    const tieneActividadReciente = resultados.some(r => {
        const diff = new Date() - new Date(r.fecha);
        return diff < (48 * 60 * 60 * 1000); 
    });

    const historialReciente = resultados.slice(-7).map((r, i) => ({
      name: `Examen ${i + 1}`,
      score: r.scoreTotal,
      fecha: new Date(r.fecha).toLocaleDateString()
    }));

    return { 
        promedio, 
        nivelPreparacion, 
        chartMaterias, 
        historialReciente, 
        total: resultados.length,
        materiaFuerte,
        materiaDebil,
        tieneActividadReciente
    };
  }, [resultados]);

  // ELIMINAMOS EL RETURN TEMPRANO DE LOADING AQUÍ

  return (
    <div className="bg-light min-vh-100 font-poppins">
      <Navbar />
      
      {/* EL HEADER (HERO) AHORA SE CARGA SIEMPRE DE INMEDIATO */}
      <div className="bg-white border-bottom py-5 mb-5 shadow-sm">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3 mb-2">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold">
                  Dashboard de Análisis
                </span>
              </div>
              <h1 className="display-5 fw-bold text-dark mb-3">
                Tu evolución, <span style={{ color: '#1e3c72' }}>{usuario?.nombre}</span>
              </h1>
              <p className="lead text-muted mb-0">Monitorea tu crecimiento académico y asegura tu lugar.</p>
            </div>
            <div className="col-lg-4 text-end d-none d-lg-block">
              <img src="https://cdn-icons-png.flaticon.com/512/3426/3426663.png" alt="Hero" width="130" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {/* LÓGICA DE CARGA MOVIDA AQUÍ ABAJO */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando datos...</span>
            </div>
          </div>
        ) : !stats ? (
          <div className="card asig-card border-0 p-5 text-center shadow-sm">
            <h3>No hay datos suficientes</h3>
            <button onClick={() => navigate('/examenes')} className="btn btn-primary rounded-pill mt-3 px-5">Iniciar Examen</button>
          </div>
        ) : (
          <div className="row g-4">
            {/* KPI PRINCIPAL: NIVEL */}
            <div className="col-lg-4">
              <div className="card asig-card border-0 p-4 shadow-sm text-center h-100">
                <h6 className="fw-bold text-muted text-uppercase mb-4">Nivel Actual</h6>
                <div className="position-relative d-flex justify-content-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" barSize={15} data={[{ value: stats.nivelPreparacion, fill: '#1e3c72' }]} startAngle={90} endAngle={-270}>
                      <RadialBar background dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <h2 className="fw-bold mb-0">{stats.nivelPreparacion}%</h2>
                    <small className="text-muted fw-bold">Dominio</small>
                  </div>
                </div>
              </div>
            </div>

            {/* CURVA DE APRENDIZAJE */}
            <div className="col-lg-8">
              <div className="card asig-card border-0 p-4 shadow-sm h-100">
                <h6 className="fw-bold text-muted text-uppercase mb-4">Progreso Temporal</h6>
                <div style={{ height: '230px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.historialReciente}>
                      <defs>
                        <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e3c72" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#1e3c72" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }} />
                      <Area type="monotone" dataKey="score" stroke="#1e3c72" strokeWidth={3} fill="url(#colorP)" />
                      <XAxis dataKey="name" hide />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ANALÍTICA POR MATERIA */}
            <div className="col-lg-7">
              <div className="card asig-card border-0 p-4 shadow-sm">
                <h6 className="fw-bold text-muted text-uppercase mb-4">Detalle por Asignatura</h6>
                <div className="row g-3">
                  {stats.chartMaterias.map((m, i) => (
                    <div key={i} className="col-12">
                      <div className="p-3 bg-light rounded-4 border border-white shadow-sm-hover transition-all">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold small">{m.name}</span>
                          <span className="fw-bold small" style={{color: m.fill}}>{m.prom}</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <motion.div className="progress-bar rounded-pill" initial={{ width: 0 }} animate={{ width: `${m.prom * 10}%` }} style={{ backgroundColor: m.fill }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PANEL DE ENFOQUE */}
            <div className="col-lg-5">
              <div className="d-flex flex-column gap-4">
                <div className="card asig-card border-0 p-4 shadow-sm" style={{borderLeft: '5px solid #198754 !important'}}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="icon-box bg-success bg-opacity-10 text-success" style={{width: 45, height: 45}}>
                            <i className="fas fa-trophy"></i>
                        </div>
                        <div>
                            <small className="fw-bold text-muted d-block">PUNTO FUERTE</small>
                            <span className="fw-bold text-dark">{stats.materiaFuerte?.name}</span>
                        </div>
                    </div>
                </div>

                <div className="card asig-card border-0 p-4 shadow-sm" style={{borderLeft: '5px solid #dc3545 !important'}}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="icon-box bg-danger bg-opacity-10 text-danger" style={{width: 45, height: 45}}>
                            <i className="fas fa-bullseye"></i>
                        </div>
                        <div>
                            <small className="fw-bold text-muted d-block">ÁREA DE ENFOQUE</small>
                            <span className="fw-bold text-dark">{stats.materiaDebil?.name}</span>
                        </div>
                    </div>
                </div>

                <div className="card asig-card border-0 p-4 shadow-sm h-100">
                    <h6 className="fw-bold text-muted text-uppercase mb-3">Actividad Reciente</h6>
                    <div className="d-grid gap-2">
                        {resultados.slice(-3).reverse().map((res, i) => (
                            <div key={i} className="d-flex align-items-center justify-content-between p-2 border-bottom border-light">
                                <div className="text-truncate" style={{maxWidth: '70%'}}>
                                    <small className="d-block fw-bold text-dark">{res.examen?.nombre}</small>
                                    <small className="text-muted" style={{fontSize: '0.7rem'}}>{new Date(res.fecha).toLocaleDateString()}</small>
                                </div>
                                <span className={`fw-bold ${res.scoreTotal >= 6 ? 'text-success' : 'text-danger'}`}>{res.scoreTotal}</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .asig-card {
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
        }
        .asig-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .icon-box {
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px; font-size: 1.1rem;
        }
        .transition-all { transition: all 0.3s ease; }
        .shadow-sm-hover:hover { background: #fff !important; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}