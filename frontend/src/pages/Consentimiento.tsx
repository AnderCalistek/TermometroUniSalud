import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { encuestaService } from '../services/encuestaService';

export function ConsentimientoPage() {
  const navigate = useNavigate();
  const [aceptado, setAceptado] = useState(false);
  const [canContact, setCanContact] = useState(false);
  
  const consentimientoMutation = useMutation({
    mutationFn: () => encuestaService.aceptarConsentimiento(canContact),
    onSuccess: () => {
      toast.success('Consentimiento registrado');
      navigate('/encuesta');
    },
    onError: () => {
      toast.error('Error al registrar consentimiento');
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptado) {
      toast.error('Debes aceptar el consentimiento para continuar');
      return;
    }
    consentimientoMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Consentimiento Informado</h1>
          
          <div className="prose max-w-none mb-8 text-gray-700 space-y-4">
            <p className="font-semibold text-lg">Índice de Bienestar WHO-5</p>
            
            <p>
              El presente cuestionario corresponde al Índice de Bienestar WHO-5, un instrumento 
              breve de tamizaje desarrollado por la Organización Mundial de la Salud, cuyo propósito 
              es explorar de manera general el nivel de bienestar emocional durante las últimas dos 
              semanas en el marco de su experiencia académica y personal.
            </p>
            
            <p>
              La participación en este tamizaje es voluntaria. La información recolectada será tratada 
              con estricta confidencialidad y utilizada exclusivamente con fines preventivos, 
              psicoeducativos y de orientación, en el marco de las acciones del área de Bienestar 
              Universitario.
            </p>
            
            <p>
              Este instrumento no genera diagnóstico psicológico ni psiquiátrico, ni reemplaza una 
              valoración clínica individual.
            </p>
            
            <p>
              Usted puede decidir no participar o retirarse en cualquier momento, sin que ello implique 
              consecuencias académicas, laborales, evaluativas o administrativas.
            </p>
            
            <p>
              En caso de que las respuestas indiquen posibles alertas en el bienestar emocional, el 
              área de Bienestar Universitario podrá ofrecer orientación y remitir, si usted lo autoriza, 
              a rutas básicas de atención y acompañamiento psicológico, respetando siempre su 
              autonomía y dignidad.
            </p>
            
            <p className="font-semibold mt-6">
              Al continuar con el diligenciamiento del cuestionario, usted declara que:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ha leído y comprendido la información suministrada.</li>
              <li>Acepta participar de manera libre, voluntaria e informada.</li>
              <li>Autoriza el uso ético, confidencial y anónimo de la información con fines 
              institucionales de bienestar y prevención.</li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="consent"
                checked={aceptado}
                onChange={(e) => setAceptado(e.target.checked)}
                className="mt-1 mr-3 h-5 w-5 text-blue-600"
                required
              />
              <label htmlFor="consent" className="text-gray-700">
                <span className="font-semibold">He leído y acepto el consentimiento informado</span> <span className="text-red-500">*</span>
              </label>
            </div>
            
            <div className="flex items-start">
              <input
                type="checkbox"
                id="contact"
                checked={canContact}
                onChange={(e) => setCanContact(e.target.checked)}
                className="mt-1 mr-3 h-5 w-5 text-blue-600"
              />
              <label htmlFor="contact" className="text-gray-700">
                Autorizo a Bienestar Universitario a contactarme si mi puntaje indica alerta
              </label>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!aceptado || consentimientoMutation.isPending}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {consentimientoMutation.isPending ? 'Procesando...' : 'Continuar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
