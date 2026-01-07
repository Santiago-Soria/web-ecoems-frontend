import axiosClient from "../api/axiosClient";

export const ExamenService = {
    // Listar todos los exámenes simulacro disponibles
    listar: async () => {
        const response = await axiosClient.get('/examenes');
        return response.data;
    },

    // Obtener las preguntas de un examen específico
    obtenerPreguntas: async (idExamen) => {
        const response = await axiosClient.get(`/examenes/${idExamen}/preguntas`);
        return response.data;
    },

    // Guardar la calificación final
    guardarResultado: async (resultado) => {
        // Payload esperado por tu backend: { "idUsuario": 1, "idExamen": 1, "scoreTotal": 8.5 }
        const response = await axiosClient.post('/resultados', resultado);
        return response.data;
    }
};