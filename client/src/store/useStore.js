import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useStore = create(
  persist(
    (set, get) => ({
      // ─── Auth ───────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('sn_token', token);
        set({ user, token, isAuthenticated: true });
        // Apply theme
        document.documentElement.setAttribute('data-theme', user.theme || 'default');
      },

      logout: () => {
        localStorage.removeItem('sn_token');
        set({ user: null, token: null, isAuthenticated: false, semesters: [], currentSemesterId: null });
      },

      updateUser: (userData) => {
        set({ user: userData });
        document.documentElement.setAttribute('data-theme', userData.theme || 'default');
      },

      // ─── Semesters ─────────────────────────────────────────
      semesters: [],
      currentSemesterId: null,
      semestersLoaded: false,

      setSemesters: (semesters) => set({ semesters, semestersLoaded: true }),

      setCurrentSemesterId: (id) => set({ currentSemesterId: id }),

      getCurrentSemester: () => {
        const { semesters, currentSemesterId, user } = get();
        if (currentSemesterId) return semesters.find(s => s._id === currentSemesterId);
        return semesters.find(s => s.number === user?.currentSemester) || semesters[0];
      },

      updateSemester: (updatedSem) => {
        set(state => ({
          semesters: state.semesters.map(s => s._id === updatedSem._id ? updatedSem : s)
        }));
      },

      addSemester: (sem) => set(state => ({ semesters: [...state.semesters, sem] })),

      // ─── UI ────────────────────────────────────────────────
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // ─── Groq Models ───────────────────────────────────────
      groqModels: [],
      selectedGroqModel: 'llama3-8b-8192',
      setGroqModels: (models) => set({ groqModels: models }),
      setSelectedGroqModel: (model) => set({ selectedGroqModel: model }),

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'studynotes-store',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentSemesterId: state.currentSemesterId,
        selectedGroqModel: state.selectedGroqModel,
        activeTab: state.activeTab
      })
    }
  )
);

export default useStore;
