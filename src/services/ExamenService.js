import axiosClient from "../api/axiosClient";

export const ExamenService = {
    listar: async () => {
        const response = await axiosClient.get('/examenes');
        return response.data;
    },

    obtenerPreguntas: async (idExamen) => {
        const response = await axiosClient.get(`/examenes/${idExamen}/preguntas`);
        return response.data;
    },

    guardarResultado: async (resultado) => {
        const response = await axiosClient.post('/resultados', resultado);
        return response.data;
    },

    // Obtiene todos los resultados del usuario para pintar las calificaciones en las tarjetas
    obtenerResultadosPorUsuario: async (idUsuario) => {
        try {
            const response = await axiosClient.get(`/resultados/usuario/${idUsuario}`);
            return response.data;
        } catch (error) {
            return [];
        }
    },

    // Obtiene el último intento de un examen específico (Ruta que agregamos al Controller de Java)
    obtenerResultadoUsuario: async (idUsuario, idExamen) => {
        try {
            const response = await axiosClient.get(`/resultados/usuario/${idUsuario}/examen/${idExamen}`);
            return response.data;
        } catch (error) {
            return null; // 404 significa que no hay intentos previos
        }
    }
};