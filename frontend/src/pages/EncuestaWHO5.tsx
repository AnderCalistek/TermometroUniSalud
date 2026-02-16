import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { encuestaService } from '../services/encuestaService';
import type { RespuestaWHO5 } from '../types';

export function EncuestaWHO5Page() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestaWHO5[]>([]);
  const [comentario, setComentario] = useState('');
  const [showComentario, setShowComentario] = useState(false);
  
  const { data: preguntasData } = useQuery({
    queryKey: ['preguntas-who5'],
    queryFn: encuestaService.obtenerPreguntas
  });
  
  const enviarMutation = useMutation({
    mutationFn: encuestaService.enviarEncuesta,
    onSuccess: (data) => {
      navigate(`/resultado/${data.id}`);
    },
    onError: () => {
      toast.error('Error al enviar encuesta');
    }
  });
  
  const preguntas = preguntasData?.preguntas || [];
  const preguntaActual = preguntas[currentQuestion];
  
  const handleRespuesta = (valor: number) => {
    const nuevasRespuestas = [...respuestas];
    const index = nuevasRespuestas.findIndex(r => r.pregunta_numero === currentQuestion + 1);
    
    if (index >= 0) {
      nuevasRespuestas[index].valor = valor;
    } else {
      nuevasRespuestas.push({
        pregunta_numero: currentQuestion + 1,
        valor
      });
    }
    
    setRespuestas(nuevasRespuestas);
  };
  
  const handleNext = () => {
    if (currentQuestion < preguntas.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowComentario(true);
    }
  };
  
  const handleFinalizar = () => {
    if (respuestas.length !== 5) {
      toast.error('Debes responder todas las preguntas');
      return;
    }
    
    enviarMutation.mutate({
      respuestas,
      comentario,
      can_contact: false
    });
  };
  
  const respuestaActual = respuestas.find(r => r.pregunta_numero === currentQuestion + 1);
  
  if (showComentario) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Comentario Opcional</h2>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
              rows={4}
              placeholder="Si deseas agregar algún comentario adicional..."
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowComentario(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ← Volver
              </button>
              <button
                onClick={handleFinalizar}
                disabled={enviarMutation.isPending}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
              >
                {enviarMutation.isPending ? 'Enviando...' : 'Finalizar Encuesta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header con progreso */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pregunta {currentQuestion + 1} de {preguntas.length}</span>
            <span>{Math.round((currentQuestion + 1) / preguntas.length * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestion + 1) / preguntas.length * 100}%` }}
            />
          </div>
        </div>
        
        {/* Pregunta */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 rounded-r-lg">
            <p className="text-sm text-gray-700">
              Durante las <strong>últimas 2 semanas</strong>, ¿con qué frecuencia has experimentado:
            </p>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {preguntaActual?.texto}
          </h2>
          
          {/* Opciones */}
          <div className="space-y-3">
            {preguntaActual?.opciones.map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => handleRespuesta(opcion.valor)}
                className={`
                  w-full p-4 text-left rounded-xl border-2 transition-all
                  ${respuestaActual?.valor === opcion.valor
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{opcion.label}</span>
                  <span className="text-sm text-gray-500">({opcion.valor})</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Botones navegación */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!respuestaActual}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {currentQuestion === preguntas.length - 1 ? 'Finalizar' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
