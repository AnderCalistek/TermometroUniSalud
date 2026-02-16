from app.config.settings import settings
from typing import List

class WHO5Service:
    """
    Servicio para cálculo de puntaje WHO-5
    
    Fórmula: Puntaje Final = (Suma de respuestas) × 4
    Rango: 0-100
    Alerta: < 13
    """
    
    @staticmethod
    def calcular_puntaje_raw(respuestas: List[int]) -> int:
        """
        Calcula el puntaje crudo (0-25)
        
        Args:
            respuestas: Lista de 5 valores (0-5)
        
        Returns:
            Suma de los valores
        """
        if len(respuestas) != 5:
            raise ValueError("Deben ser exactamente 5 respuestas")
        
        if not all(0 <= r <= 5 for r in respuestas):
            raise ValueError("Todas las respuestas deben estar entre 0 y 5")
        
        return sum(respuestas)
    
    @staticmethod
    def calcular_puntaje_final(puntaje_raw: int) -> int:
        """
        Calcula el puntaje final (0-100)
        
        Args:
            puntaje_raw: Puntaje crudo (0-25)
        
        Returns:
            Puntaje final = puntaje_raw × 4
        """
        if not 0 <= puntaje_raw <= 25:
            raise ValueError("El puntaje raw debe estar entre 0 y 25")
        
        return puntaje_raw * 4
    
    @staticmethod
    def es_alerta(puntaje_final: int) -> bool:
        """
        Determina si el puntaje indica alerta
        
        Args:
            puntaje_final: Puntaje final (0-100)
        
        Returns:
            True si puntaje < 13 (umbral de alerta)
        """
        return puntaje_final < settings.WHO5_UMBRAL_ALERTA
    
    @staticmethod
    def clasificar_bienestar(puntaje_final: int) -> dict:
        """
        Clasifica el nivel de bienestar
        
        Args:
            puntaje_final: Puntaje final (0-100)
        
        Returns:
            Dict con nivel, color y mensaje
        """
        if puntaje_final < 13:
            return {
                "nivel": "Bajo bienestar",
                "categoria": "alerta",
                "color": "#E53E3E",
                "mensaje": "Tu nivel de bienestar puede requerir atención. Te invitamos a contactar al área de Bienestar Universitario."
            }
        elif puntaje_final < 51:
            return {
                "nivel": "Bienestar moderado",
                "categoria": "bajo",
                "color": "#D69E2E",
                "mensaje": "Tu nivel de bienestar es moderado. Considera explorar recursos de apoyo disponibles."
            }
        elif puntaje_final < 76:
            return {
                "nivel": "Buen bienestar",
                "categoria": "medio",
                "color": "#4A90E2",
                "mensaje": "Tu nivel de bienestar es bueno. Continúa cuidando tu salud emocional."
            }
        else:
            return {
                "nivel": "Excelente bienestar",
                "categoria": "alto",
                "color": "#38A169",
                "mensaje": "Tu nivel de bienestar es excelente. ¡Sigue así!"
            }
    
    @staticmethod
    def hay_cambio_significativo(puntaje_anterior: int, puntaje_actual: int) -> bool:
        """
        Determina si hay cambio significativo entre dos mediciones
        
        Args:
            puntaje_anterior: Puntaje de medición anterior
            puntaje_actual: Puntaje de medición actual
        
        Returns:
            True si diferencia absoluta >= 10 puntos
        """
        diferencia = abs(puntaje_actual - puntaje_anterior)
        return diferencia >= settings.WHO5_CAMBIO_SIGNIFICATIVO
    
    @staticmethod
    def obtener_preguntas_who5() -> List[dict]:
        """
        Retorna las 5 preguntas oficiales del WHO-5 en español
        
        Returns:
            Lista de diccionarios con las preguntas
        """
        return [
            {
                "numero": 1,
                "texto": "Me he sentido alegre y de buen humor",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            },
            {
                "numero": 2,
                "texto": "Me he sentido tranquilo y relajado",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            },
            {
                "numero": 3,
                "texto": "Me he sentido activo y enérgico",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            },
            {
                "numero": 4,
                "texto": "Me he despertado fresco y descansado",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            },
            {
                "numero": 5,
                "texto": "Mi vida cotidiana ha estado llena de cosas que me interesan",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            }
        ]
