import http from './axios';

// Auth
export const auth = {
  register:       (data) => http.post('/auth/register', data),
  login:          (data) => http.post('/auth/login', data),
  logout:         ()     => http.post('/auth/logout'),
  me:             ()     => http.get('/auth/me'),
  updateProfile:  (data) => http.put('/auth/profile', data),
  changePassword:       (data) => http.put('/auth/change-password', data),
  resendVerification:   ()     => http.post('/auth/resend-verification'),
  verifyPhone:          ()     => http.post('/auth/verify-phone'),
};

// Jobs
export const jobs = {
  list:       (params) => http.get('/jobs', { params }),
  get:        (id)     => http.get(`/jobs/${id}`),
  create:     (data)   => http.post('/jobs', data),
  update:     (id, d)  => http.put(`/jobs/${id}`, d),
  delete:     (id)     => http.delete(`/jobs/${id}`),
  save:       (id)     => http.post(`/jobs/${id}/save`),
  myJobs:     (params) => http.get('/jobs/my/postings', { params }),
  categories: ()       => http.get('/categories'),
};

// Proposals
export const proposals = {
  list:        (jobId) => http.get(`/jobs/${jobId}/proposals`),
  create:      (data)  => http.post(`/jobs/${data.job_id}/proposals`, data),
  accept:      (id)    => http.post(`/proposals/${id}/accept`),
  reject:      (id)    => http.post(`/proposals/${id}/reject`),
  myProposals: (p)     => http.get('/proposals/my', { params: p }),
};

// Freelancers
export const freelancers = {
  list:            (params) => http.get('/freelancers', { params }),
  get:             (username) => http.get(`/freelancers/${username}`),
  updateProfile:   (data)    => http.put('/freelancer/profile', data),
  addSkills:       (data)    => http.post('/freelancer/skills', data),
  addPortfolio:    (data)    => http.post('/freelancer/portfolio', data),
  deletePortfolio: (id)      => http.delete(`/freelancer/portfolio/${id}`),
  dashboard:       ()        => http.get('/freelancer/dashboard'),
};

// Chat
export const chat = {
  conversations: ()       => http.get('/chat/conversations'),
  messages:      (id)     => http.get(`/chat/conversations/${id}/messages`),
  send:          (data)   => http.post(`/chat/conversations/${data.conversation_id}/send`, data),
  start:         (data)   => http.post('/chat/conversations/start', data),
};

// Payments
export const payments = {
  wallet:          ()     => http.get('/payments/wallet'),
  overview:        ()     => http.get('/payments/overview'),
  fundEscrow:      (data) => http.post('/payments/deposit', data),
  releaseMilestone:(id)   => http.post(`/payments/milestones/${id}/release`),
};

// AI
export const aiApi = {
  generateProposal: (data) => http.post('/ai/generate-proposal', data),
  matchFreelancers: (data) => http.post('/ai/match-freelancers', data),
  chat:             (data) => http.post('/ai/chat', data),
  analyzeProfile:   ()     => http.post('/ai/analyze-profile'),
  smartSearch:      (q)    => http.post('/ai/smart-search', { query: q }),
};

// Admin
export const admin = {
  dashboard: ()   => http.get('/admin/dashboard'),
  users:     (p)  => http.get('/admin/users', { params: p }),
  banUser:   (id) => http.post(`/admin/users/${id}/ban`),
  verifyUser:(id) => http.post(`/admin/users/${id}/verify`),
  analytics: (p)  => http.get('/admin/analytics', { params: p }),
};

// Reviews
export const reviews = {
  forFreelancer: (userId) => http.get(`/reviews/freelancer/${userId}`),
  create:        (data)   => http.post('/reviews', data),
  delete:        (id)     => http.delete(`/reviews/${id}`),
};

// Default namespace export — pages import as: import { api } from '../../api'
export const api = { auth, jobs, proposals, freelancers, chat, payments, aiApi, admin, reviews };
export default api;
