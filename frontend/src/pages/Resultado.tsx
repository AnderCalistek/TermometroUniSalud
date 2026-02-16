
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { encuestaService } from '../services/encuestaService';

export function ResultadoPage() {
  const { id } = useParams<{ id: string }>();
  const encuestaId = parseInt(id || '0');
  
  const { data: resultado, isLoading } = useQuery({
    queryKey: ['resultado', encuestaId],
    queryFn: () => encuestaService.obtenerResultado(encuestaId)
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando resultado...</p>
        </div>
      </div>
    );
  }
  
  if (!resultado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se pudo cargar el resultado</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Volver al inicio</Link>
        </div>
      </div>
    );
  }
  
  const { clasificacion, puntaje_final, es_alerta } = resultado;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">✓ Encuesta Completada</h1>
            <p className="text-gray-600">Gracias por participar</p>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-block">
              <div className="text-5xl font-bold mb-2" style={{ color: clasificacion.color }}>
                {puntaje_final}/100
              </div>
              <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${puntaje_final}%`,
                    backgroundColor: clasificacion.color
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl mb-6`} style={{ backgroundColor: `${clasificacion.color}15` }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: clasificacion.color }}>
              {clasificacion.nivel}
            </h2>
            <p className="text-gray-700">{clasificacion.mensaje}</p>
          </div>
          
          {es_alerta && (
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg mb-6">
              <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ Recursos de Apoyo</h3>
              <p className="text-gray-700 mb-4">
                Tu nivel de bienestar puede requerir atención. Te invitamos a contactar al área de Bienestar Universitario:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>📞 Ext. 123</li>
                <li>📧 bienestar@uniempresarial.edu.co</li>
                <li>🏢 Edificio A, Piso 2</li>
                <li>⏰ Horario: Lunes a Viernes 8am-5pm</li>
              </ul>
            </div>
          )}
          
          {resultado.cambio_significativo && (
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-r-lg mb-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Cambio Significativo Detectado</h3>
              <p className="text-gray-700">
                Tu puntaje ha cambiado {Math.abs(resultado.cambio_significativo.diferencia)} puntos 
                ({resultado.cambio_significativo.tipo === 'mejora' ? 'mejora' : 'empeoramiento'}) 
                respecto a tu última evaluación.
              </p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Link
              to="/"
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-center"
            >
              Volver al Inicio
            </Link>
            <Link
              to="/encuesta"
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-center"
            >
              Realizar Otra Encuesta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
