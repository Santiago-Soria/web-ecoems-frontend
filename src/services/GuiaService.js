import axiosClient from "../api/axiosClient";

export const GuiaService = {
    obtenerAsignaturas: async () => {
        const response = await axiosClient.get('/asignaturas');
        return response.data;
    },
    obtenerTemasPorAsignatura: async (idAsignatura) => {
        const response = await axiosClient.get(`/asignaturas/${idAsignatura}/temas`);
        return response.data;
    },
    obtenerSubtemasPorTema: async (idTema) => {
        const response = await axiosClient.get(`/subtemas/tema/${idTema}`);
        return response.data;
    },
    obtenerDetalleSubtema: async (idSubtema) => {
        const response = await axiosClient.get(`/subtemas/${idSubtema}`);
        return response.data;
    }
};