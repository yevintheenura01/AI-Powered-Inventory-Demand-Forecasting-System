import { create } from 'zustand';

const API_BASE = 'http://127.0.0.1:5000/api';

const useStore = create((set, get) => ({
  products: [],
  salesStats: {
    totalRevenue: 0,
    totalSalesCount: 0,
    categoryBreakdown: [],
    topProducts: [],
  },
  activeProductForecast: {
    product: null,
    history: [],
    forecast: [],
  },
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      set({ products: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSalesStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/sales/stats`);
      if (!response.ok) throw new Error('Failed to fetch sales stats');
      const data = await response.json();
      set({ salesStats: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchForecast: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/forecast/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch forecasts');
      const data = await response.json();
      set({ activeProductForecast: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  generateForecast: async (productId = null, daysToForecast = 30) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/forecast/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, daysToForecast }),
      });
      if (!response.ok) throw new Error('Failed to generate forecast');
      const data = await response.json();
      
      // Refresh current product forecast if it is the active one
      const currentActive = get().activeProductForecast.product;
      if (currentActive && (!productId || productId === currentActive._id)) {
        await get().fetchForecast(currentActive._id);
      }
      
      // Refresh products (currentStock might change in backend)
      await get().fetchProducts();
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to add product');
      const newProduct = await response.json();
      set((state) => ({
        products: [...state.products, newProduct],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to update product');
      const updatedProduct = await response.json();
      
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? updatedProduct : p)),
        loading: false,
      }));

      // If active product forecast is this product, update product details
      const activeForecast = get().activeProductForecast;
      if (activeForecast.product && activeForecast.product._id === id) {
        set({
          activeProductForecast: {
            ...activeForecast,
            product: updatedProduct,
          },
        });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
        loading: false,
      }));

      // Clear active forecast if it was this product
      const activeForecast = get().activeProductForecast;
      if (activeForecast.product && activeForecast.product._id === id) {
        set({
          activeProductForecast: {
            product: null,
            history: [],
            forecast: [],
          },
        });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

export default useStore;
