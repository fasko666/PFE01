import http from './axios';

// Auth
export const auth = {
  register:       (data) => http.post('/auth/register', data),
  login:          (data) => http.post('/auth/login', data),
  logout:         ()     => http.post('/auth/logout'),
  me:             ()     => http.get('/auth/me'),
  updateProfile:  (data) => http.put('/auth/profile', data),
  updateAvatar:   (data) => http.post('/auth/avatar', data),
  changePassword:       (data) => http.put('/auth/change-password', data),
  resendVerification:   ()     => http.post('/auth/resend-verification'),
  verifyPhone:          ()     => http.post('/auth/verify-phone'),
  forgotPassword: (email) => http.post('/auth/forgot-password', { email }),
  resetPassword:  (data)  => http.post('/auth/reset-password', data),
};

// Two-Factor Authentication
export const twoFactor = {
  status:        ()     => http.get('/two-factor/status'),
  enable:        ()     => http.post('/two-factor/enable'),
  confirm:       (code) => http.post('/two-factor/confirm', { code }),
  disable:       (data) => http.post('/two-factor/disable', data),
  qrCode:        ()     => http.get('/two-factor/qr-code'),
  recoveryCodes: ()     => http.get('/two-factor/recovery-codes'),
  regenerate:    ()     => http.post('/two-factor/recovery-codes/regenerate'),
};

// Saved freelancers (bookmarks)
export const savedFreelancers = {
  list:    (params)    => http.get('/saved-freelancers', { params }),
  save:    (freelancerId) => http.post('/saved-freelancers', { freelancer_id: freelancerId }),
  unsave:  (freelancerId) => http.delete(`/saved-freelancers/${freelancerId}`),
  check:   (freelancerId) => http.get(`/saved-freelancers/check/${freelancerId}`),
};

// Talent lists (named curated groups)
export const talentLists = {
  list:        ()         => http.get('/talent-lists'),
  create:      (data)     => http.post('/talent-lists', data),
  get:         (id)       => http.get(`/talent-lists/${id}`),
  update:      (id, data) => http.put(`/talent-lists/${id}`, data),
  delete:      (id)       => http.delete(`/talent-lists/${id}`),
  addMember:   (id, freelancerId, note) => http.post(`/talent-lists/${id}/members`, { freelancer_id: freelancerId, note }),
  removeMember:(id, freelancerId)       => http.delete(`/talent-lists/${id}/members/${freelancerId}`),
};

// Tax documents
export const taxDocs = {
  list:        ()           => http.get('/tax-documents'),
  create:      (data)       => http.post('/tax-documents', data),
  get:         (id)         => http.get(`/tax-documents/${id}`),
  pdfUrl:      (id)         => `${http.defaults.baseURL}/tax-documents/${id}/pdf`,
  adminList:   (params)     => http.get('/admin/tax-documents', { params }),
  adminApprove:(id)         => http.post(`/admin/tax-documents/${id}/approve`),
  adminReject: (id, reason) => http.post(`/admin/tax-documents/${id}/reject`, { rejection_reason: reason }),
};

// Global search
export const search = {
  query:    (q, params) => http.get('/search', { params: { q, ...(params || {}) } }),
  suggest:  (q)         => http.get('/search/suggest', { params: { q } }),
};

// Billing & subscriptions
export const billing = {
  plans:    ()         => http.get('/plans'),
  current:  ()         => http.get('/billing/subscription'),
  checkout: (planSlug) => http.post('/billing/checkout', { plan_slug: planSlug }),
  swap:     (planSlug) => http.post('/billing/swap',     { plan_slug: planSlug }),
  cancel:   ()         => http.post('/billing/cancel'),
  resume:   ()         => http.post('/billing/resume'),
  portal:   ()         => http.get('/billing/portal'),
  invoices: ()         => http.get('/billing/invoices'),
};

// Web Push
export const push = {
  vapidPublicKey: ()       => http.get('/push/vapid-public-key'),
  subscribe:      (data)   => http.post('/push/subscribe', data),
  unsubscribe:    (endpoint) => http.delete('/push/subscribe', { data: { endpoint } }),
};

// Identity Verification (KYC)
export const kyc = {
  status:       ()         => http.get('/verify-identity/status'),
  submit:       (formData) => http.post('/verify-identity', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  adminList:    (params)     => http.get('/admin/kyc', { params }),
  adminGet:     (id)         => http.get(`/admin/kyc/${id}`),
  adminApprove: (id)         => http.post(`/admin/kyc/${id}/approve`),
  adminReject:  (id, reason) => http.post(`/admin/kyc/${id}/reject`, { rejection_reason: reason }),
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
  onboarding:      (data)    => http.post('/freelancer/onboarding', data),
  addSkills:       (data)    => http.post('/freelancer/skills', data),
  addPortfolio:    (data)    => http.post('/freelancer/portfolio', data),
  deletePortfolio: (id)      => http.delete(`/freelancer/portfolio/${id}`),
  dashboard:       ()        => http.get('/freelancer/dashboard'),
};

// Chat
export const chat = {
  conversations: ()       => http.get('/chat/conversations'),
  messages:      (id, params) => http.get(`/chat/conversations/${id}/messages`, { params }),
  send:          (data)   => http.post(`/chat/conversations/${data.conversation_id}/send`, data),
  start:         (data)   => http.post('/chat/conversations/start', data),

  // Realtime helpers — every action below also emits a broadcast event
  typing:        (id, isTyping)   => http.post(`/chat/conversations/${id}/typing`, { is_typing: !!isTyping }),
  markRead:      (id)             => http.post(`/chat/conversations/${id}/read`),
  markDelivered: (messageId)      => http.post(`/chat/messages/${messageId}/delivered`),
  edit:          (messageId, content) => http.put(`/chat/messages/${messageId}`, { content }),
  delete:        (messageId)      => http.delete(`/chat/messages/${messageId}`),
  react:         (messageId, emoji) => http.post(`/chat/messages/${messageId}/reactions`, { emoji }),
  search:        (q)              => http.get('/chat/conversations/search', { params: { q } }),
};

// Notifications
export const notifications = {
  list:        ()    => http.get('/notifications'),
  markRead:    (id)  => http.post(`/notifications/${id}/read`),
  markAllRead: ()    => http.post('/notifications/read-all'),
};

// Contracts (core)
export const contracts = {
  list:        (params)         => http.get('/contracts', { params }),
  myActive:    (params)         => http.get('/contracts/my/active', { params }),
  myCompleted: (params)         => http.get('/contracts/my/completed', { params }),
  myDisputed:  (params)         => http.get('/contracts/my/disputed', { params }),
  get:         (id)             => http.get(`/contracts/${id}`),
  complete:    (id)             => http.post(`/contracts/${id}/complete`),
  cancel:      (id, reason)     => http.post(`/contracts/${id}/cancel`, { cancellation_reason: reason }),
  dispute:     (id, reason)     => http.post(`/contracts/${id}/dispute`, { dispute_reason: reason }),
  resolveDispute: (id, payload) => http.post(`/contracts/${id}/resolve-dispute`, payload),
  archive:     (id)             => http.post(`/contracts/${id}/archive`),
  unarchive:   (id)             => http.post(`/contracts/${id}/unarchive`),

  // Milestones
  milestones:        (id)                 => http.get(`/contracts/${id}/milestones`),
  createMilestone:   (id, data)           => http.post(`/contracts/${id}/milestones`, data),
  updateMilestone:   (mid, data)          => http.put(`/milestones/${mid}`, data),
  deleteMilestone:   (mid)                => http.delete(`/milestones/${mid}`),
  submitMilestone:   (mid, data)          => http.post(`/milestones/${mid}/submit`, data),
  approveMilestone:  (mid)                => http.post(`/milestones/${mid}/approve`),
  rejectMilestone:   (mid, reason)        => http.post(`/milestones/${mid}/reject`, { rejection_reason: reason }),

  // Files
  files:             (id)                 => http.get(`/contracts/${id}/files`),
  uploadFile:        (id, formData)       => http.post(`/contracts/${id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadFileVersion: (fid, formData)      => http.post(`/contract-files/${fid}/version`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteFile:        (fid)                => http.delete(`/contract-files/${fid}`),
  downloadFileUrl:   (fid)                => `${http.defaults.baseURL}/contract-files/${fid}/download`,

  // Time tracking
  timeLogs:    (id, params)               => http.get(`/contracts/${id}/time`, { params }),
  timeWeekly:  (id)                       => http.get(`/contracts/${id}/time/weekly`),
  timeStart:   (id, data)                 => http.post(`/contracts/${id}/time/start`, data),
  timeStop:    (id, data)                 => http.post(`/contracts/${id}/time/stop`, data),

  // Extensions
  extensions:        (id)                 => http.get(`/contracts/${id}/extensions`),
  requestExtension:  (id, data)           => http.post(`/contracts/${id}/extensions`, data),
  respondExtension:  (xid, data)          => http.post(`/contract-extensions/${xid}/respond`, data),

  // Analytics + activity feed
  analytics:   (id)                       => http.get(`/contracts/${id}/analytics`),
  activity:    (id)                       => http.get(`/contracts/${id}/activity`),

  // PDF URLs (open in new tab)
  pdfUrl:        (id)                     => `${http.defaults.baseURL}/contracts/${id}/pdf`,
  disputePdfUrl: (id)                     => `${http.defaults.baseURL}/contracts/${id}/dispute-pdf`,
};

// Milestones (standalone clean namespace — matches Upwork-style spec)
export const milestones = {
  list:    (contractId)        => http.get(`/contracts/${contractId}/milestones`),
  create:  (contractId, data)  => http.post(`/contracts/${contractId}/milestones`, data),
  get:     (id)                => http.get(`/milestones/${id}`),
  update:  (id, data)          => http.put(`/milestones/${id}`, data),
  delete:  (id)                => http.delete(`/milestones/${id}`),
  submit:  (id, data)          => http.post(`/milestones/${id}/submit`, data),
  approve: (id)                => http.post(`/milestones/${id}/approve`),
  reject:  (id, reason)        => http.post(`/milestones/${id}/reject`, { rejection_reason: reason }),
};

// Chat attachment upload (multipart)
export const chatAttachments = {
  upload: (conversationId, formData) =>
    http.post(`/chat/conversations/${conversationId}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Payments
export const payments = {
  wallet:          ()         => http.get('/payments/wallet'),
  overview:        ()         => http.get('/payments/overview'),
  deposit:         (data)     => http.post('/payments/deposit', data),
  fundEscrow:      (cId, data)=> http.post(`/payments/contracts/${cId}/fund-escrow`, data),
  releaseMilestone:(id, data) => http.post(`/payments/milestones/${id}/release`, data),

  // Withdrawals
  myWithdrawals:   ()         => http.get('/payments/withdrawals'),
  requestWithdrawal:(data)    => http.post('/payments/withdrawals', data),

  // Stripe
  stripeDepositSession: (amount) => http.post('/payments/stripe/deposit-session', { amount }),
  stripeConnectOnboard: ()       => http.post('/payments/stripe/connect/onboard'),
  stripeConnectStatus:  ()       => http.get('/payments/stripe/connect/status'),
};

// Admin finance
export const adminFinance = {
  dashboard:    ()              => http.get('/admin/finance/dashboard'),
  withdrawals:  (params)        => http.get('/admin/finance/withdrawals', { params }),
  approveWithdrawal: (id, data) => http.post(`/admin/finance/withdrawals/${id}/approve`, data),
  rejectWithdrawal:  (id, data) => http.post(`/admin/finance/withdrawals/${id}/reject`, data),
  settings:     ()              => http.get('/admin/finance/settings'),
  updateSettings:(data)         => http.put('/admin/finance/settings', data),
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
export const api = { auth, jobs, proposals, freelancers, chat, payments, aiApi, admin, adminFinance, reviews, notifications, contracts, milestones, chatAttachments, twoFactor, kyc, savedFreelancers, talentLists, taxDocs, search, push, billing };
export default api;
