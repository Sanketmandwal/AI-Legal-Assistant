// src/api/aiApi.js
import axios from 'axios';

// The FastAPI backend URL
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Common configuration for AI requests
 * Uses i18next language if available in local storage
 */
const getLanguage = () => {
  const i18nLng = localStorage.getItem('i18nextLng') || 'en';
  return i18nLng.startsWith('hi') ? 'hindi' : 
         i18nLng.startsWith('mr') ? 'marathi' : 'english';
};

/**
 * AI API calls
 */
export const aiApi = {
  // General Legal Query
  query: async (queryText, role = 'advisor', sessionId = null) => {
    const res = await aiClient.post('/query', {
      query: queryText,
      role: role,
      language: getLanguage(),
      session_id: sessionId,
      top_k: 5
    });
    return res.data;
  },

  // FIR Generation
  generateFir: async (params) => {
    const res = await aiClient.post('/fir', {
      ...params,
      language: getLanguage()
    });
    return res.data;
  },

  // Document/Scenario Analysis
  analyze: async (scenario, availableEvidence = [], role = 'researcher') => {
    const res = await aiClient.post('/analyze', {
      scenario,
      available_evidence: availableEvidence,
      role,
      language: getLanguage()
    });
    return res.data;
  },

  // Timeline Generator
  generateTimeline: async (scenario, caseType = null) => {
    const res = await aiClient.post('/timeline', {
      scenario,
      case_type: caseType,
      language: getLanguage()
    });
    return res.data;
  },

  // Risk Assessment (for Police)
  assessRisk: async (scenario) => {
    const res = await aiClient.post('/risk', {
      scenario,
      language: getLanguage()
    });
    return res.data;
  }
};
