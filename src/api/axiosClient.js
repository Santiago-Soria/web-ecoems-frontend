import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://ecoems-api.onrender.com/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;