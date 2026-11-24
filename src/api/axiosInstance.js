import axios from 'axios';

console.log("Jalur Base URL Axios yang Aktif:", import.meta.env.VITE_API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🌟 PERBAIKAN INTERCEPTOR UTAMA: Mengambil string token asli dari dalam objek user
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Ambil data saas_user dari localStorage
    const savedUser = localStorage.getItem('saas_user');
    
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
         console.log(userObj);
        const tokenString = userObj?.token || userObj?.accessToken;

        console.log(tokenString);

        if (tokenString) {
          config.headers.Authorization = `Bearer ${tokenString}`;
        }
      } catch (e) {
        console.error("Gagal melakukan parsing JSON saas_user:", e);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
