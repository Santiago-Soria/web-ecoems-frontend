import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Breadcrumbs({ items }) {
  // items espera un array: [{ label: 'Inicio', path: '/dashboard' }, { label: 'Matemáticas', path: null }]
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb" style={{ backgroundColor: 'transparent', padding: 0 }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li 
              key={index} 
              className={`breadcrumb-item ${isLast ? 'active' : ''}`}
              aria-current={isLast ? 'page' : undefined}
            >
              {isLast || !item.path ? (
                <span className="fw-bold text-dark">{item.label}</span>
              ) : (
                <Link to={item.path} className="text-decoration-none" style={{ color: 'var(--primary-color)' }}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}