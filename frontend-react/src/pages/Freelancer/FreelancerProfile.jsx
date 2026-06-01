import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, DollarSign, MessageSquare,
  UserPlus, Edit3, X, Briefcase, ExternalLink, Trash2,
  BadgeCheck, Send, AlertCircle,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import UserAvatar from '../../components/ui/UserAvatar';
import toast from 'react-hot-toast';

const AVAIL_CONFIG = {
  available:     { label: 'Available',     cls: 'text-green-400',  dot: 'bg-green-400' },
  busy:          { label: 'Busy',          cls: 'text-yellow-400', dot: 'bg-yellow-400' },
  not_available: { label: 'Not Available', cls: 'text-red-400',    dot: 'bg-red-400' },
};

const TABS = ['overview', 'portfolio', 'reviews'];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
});

function StarDisplay({ rating, count, size = 'sm' }) {
  const r = Math.round(parseFloat(rating) || 0);
  const sz = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`${sz} ${n <= r ? 'text-yellow-400 fill-yellow-400' : 'text-dark-700'}`}
            strokeWidth={n <= r ? 0 : 1.5}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-dark-500">
          {parseFloat(rating || 0).toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}

function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              n <= active ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'
            }`}
            strokeWidth={n <= active ? 0 : 1.5}
          />
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

function ReviewModal({ freelancer, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [breakdown, setBreakdown] = useState({ communication: 0, quality: 0, timeliness: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a rating'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        reviewee_id: freelancer.id,
        rating,
        comment: comment.trim() || null,
        breakdown: Object.values(breakdown).some((v) => v > 0)
          ? breakdown
          : null,
      };
      const res = await api.reviews.create(payload);
      toast.success('Review submitted!');
      onSuccess(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response.data.errors || {}).flat().join(', ')
        : 'Failed to submit review';
      setError(typeof msg === 'string' ? msg : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="card p-6 w-full max-w-md shadow-dialog"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-dark-100">Write a Review</h2>
              <p className="text-xs text-dark-500 mt-0.5">for {freelancer.name}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-dark-500 hover:text-white hover:bg-dark-800 transition-colors">
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Overall rating */}
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2">Overall Rating *</label>
              <div className="flex items-center gap-3">
                <StarInput value={rating} onChange={setRating} />
                {rating > 0 && (
                  <span className="text-sm font-medium text-yellow-400">{RATING_LABELS[rating]}</span>
                )}
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-dark-400">Breakdown (optional)</label>
              {[
                { key: 'communication', label: 'Communication' },
                { key: 'quality',       label: 'Quality' },
                { key: 'timeliness',    label: 'Timeliness' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-dark-500 w-28">{label}</span>
                  <StarInput
                    value={breakdown[key]}
                    onChange={(v) => setBreakdown((b) => ({ ...b, [key]: v }))}
                  />
                </div>
              ))}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1.5">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Share your experience working with this freelancer…"
                className="input text-sm resize-none h-24"
              />
              <p className="text-xs text-dark-600 text-right mt-1">{comment.length}/1000</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-sm flex-1">
                Cancel
              </button>
              <button type="submit" disabled={submitting || !rating} className="btn btn-primary btn-sm flex-1 gap-1.5">
                <Send className="w-3.5 h-3.5" strokeWidth={2} />
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function FreelancerProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const isOwnProfile = !username || username === user?.username;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [skillInput, setSkillInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [form, setForm] = useState({
    title: '', bio: '', hourly_rate: '', country: '', phone: '',
    availability: 'available',
  });

  const loadProfile = async () => {
    try {
      const target = username || user?.username;
      const res = target ? await api.freelancers.get(target) : await api.auth.me();
      const data = res.data.data || res.data.user;
      setProfile(data);
      setForm({
        title: data.freelancer_profile?.title || '',
        bio: data.freelancer_profile?.bio || '',
        hourly_rate: data.freelancer_profile?.hourly_rate || '',
        country: data.country || '',
        phone: data.phone || '',
        availability: data.freelancer_profile?.availability || 'available',
      });
    } catch {
      toast.error('Profile not found');
      navigate('/freelancers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, [username]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.freelancers.updateProfile(form);
      setProfile((p) => ({ ...p, ...res.data.data }));
      if (isOwnProfile) updateUser(res.data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const skill = skillInput.trim().replace(',', '');
      try {
        await api.freelancers.addSkills({ skills: [skill] });
        await loadProfile();
        setSkillInput('');
        toast.success('Skill added');
      } catch { toast.error('Failed to add skill'); }
    }
  };

  const removePortfolio = async (id) => {
    try {
      await api.freelancers.deletePortfolio(id);
      setProfile((p) => ({ ...p, portfolios: p.portfolios?.filter((x) => x.id !== id) }));
    } catch { toast.error('Failed to remove portfolio'); }
  };

  const handleReviewSuccess = (newReview) => {
    setShowReviewModal(false);
    const reviewerData = {
      id: user?.id,
      name: user?.name,
      username: user?.username,
      avatar_url: user?.avatar_url,
    };
    const full = { ...newReview, reviewer: reviewerData };
    setProfile((p) => {
      const reviews = [full, ...(p.reviews || [])];
      const avg = reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length;
      return {
        ...p,
        reviews,
        reviews_count: reviews.length,
        avg_rating: avg.toFixed(2),
        freelancer_profile: p.freelancer_profile
          ? { ...p.freelancer_profile, avg_rating: avg.toFixed(2), total_reviews: reviews.length }
          : p.freelancer_profile,
      };
    });
  };

  const deleteReview = async (reviewId) => {
    try {
      await api.reviews.delete(reviewId);
      toast.success('Review deleted');
      setProfile((p) => {
        const reviews = (p.reviews || []).filter((r) => r.id !== reviewId);
        const avg = reviews.length
          ? reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length
          : 0;
        return {
          ...p,
          reviews,
          reviews_count: reviews.length,
          avg_rating: avg.toFixed(2),
          freelancer_profile: p.freelancer_profile
            ? { ...p.freelancer_profile, avg_rating: avg.toFixed(2), total_reviews: reviews.length }
            : p.freelancer_profile,
        };
      });
    } catch { toast.error('Failed to delete review'); }
  };

  const alreadyReviewed = profile?.reviews?.some((r) => r.reviewer?.id === user?.id);
  const canReview = !isOwnProfile && user && user.role !== 'freelancer' && !alreadyReviewed;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="card p-6">
          <div className="flex gap-5">
            <div className="skeleton w-20 h-20 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-6 rounded-lg w-1/3" />
              <div className="skeleton h-4 rounded-lg w-1/2" />
              <div className="skeleton h-4 rounded-lg w-1/4" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="card p-5 h-20 skeleton" />)}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const avgRating = parseFloat(profile.avg_rating) || parseFloat(profile.freelancer_profile?.avg_rating) || 0;
  const avail = AVAIL_CONFIG[profile.freelancer_profile?.availability] || AVAIL_CONFIG.available;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Hero card */}
      <motion.div {...fadeUp(0)} className="card p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="relative shrink-0">
            <UserAvatar user={profile} size={80} className="!rounded-2xl ring-2 ring-dark-700" />
            {profile.is_online && (
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-950" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input font-semibold"
                  placeholder="Professional title"
                />
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="input h-24 resize-none text-sm"
                  placeholder="Write your bio…"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
                    <input
                      type="number"
                      value={form.hourly_rate}
                      onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                      className="input pl-7"
                      placeholder="Hourly rate"
                    />
                  </div>
                  <input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="input"
                    placeholder="Country"
                  />
                </div>
                <select
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="input"
                >
                  <option value="available">Available for work</option>
                  <option value="busy">Busy</option>
                  <option value="not_available">Not available</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm gap-1.5">
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                    Cancel
                  </button>
                  <button onClick={saveProfile} disabled={saving} className="btn btn-primary btn-sm">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl font-bold text-dark-100">{profile.name}</h1>
                  {profile.is_verified && (
                    <BadgeCheck className="w-5 h-5 text-primary-400 shrink-0" strokeWidth={2} />
                  )}
                  {profile.freelancer_profile?.is_top_rated && (
                    <span className="badge text-2xs bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-yellow-400" strokeWidth={0} />
                      Top Rated
                    </span>
                  )}
                </div>
                <p className="text-dark-300 text-sm mb-2">{profile.freelancer_profile?.title || 'Freelancer'}</p>
                <div className="flex items-center gap-4 flex-wrap text-xs text-dark-500 mb-3">
                  {profile.country && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" strokeWidth={2} />
                      {profile.country}
                    </span>
                  )}
                  <StarDisplay rating={avgRating} count={profile.reviews_count || 0} />
                  {profile.freelancer_profile?.hourly_rate && (
                    <span className="font-semibold text-green-400 flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3" strokeWidth={2} />
                      {profile.freelancer_profile.hourly_rate}/hr
                    </span>
                  )}
                  <span className={`flex items-center gap-1 ${avail.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} />
                    {avail.label}
                  </span>
                </div>
                {profile.freelancer_profile?.bio && (
                  <p className="text-dark-400 text-sm leading-relaxed">{profile.freelancer_profile.bio}</p>
                )}
              </>
            )}
          </div>

          {!editing && (
            <div className="flex gap-2 shrink-0">
              {isOwnProfile ? (
                <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" strokeWidth={2} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={async () => {
                      try {
                        await api.chat.start({ user_id: profile.id });
                        navigate('/messages');
                      } catch { toast.error('Failed to start chat'); }
                    }}
                    className="btn btn-ghost btn-sm gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
                    Message
                  </button>
                  <button className="btn btn-primary btn-sm gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                    Hire Now
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Briefcase,  label: 'Jobs Done',   value: profile.completed_contracts || 0,  color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { icon: Star,       label: 'Rating',      value: avgRating.toFixed(1),               color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
          { icon: DollarSign, label: 'Hourly Rate', value: profile.freelancer_profile?.hourly_rate ? `$${profile.freelancer_profile.hourly_rate}` : '—', color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5 text-center">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-4 h-4 ${s.color}`} strokeWidth={2} />
              </div>
              <div className="text-xl font-bold text-dark-100">{s.value}</div>
              <div className="text-xs text-dark-500 mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeUp(0.08)} className="flex gap-1 p-1 card rounded-xl w-fit shadow-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === t ? 'bg-dark-700 text-dark-100 shadow-sm' : 'text-dark-400 hover:text-dark-100'
            }`}
          >
            {t}
            {t === 'reviews' && (profile.reviews_count || 0) > 0 && (
              <span className="ml-1.5 text-2xs text-dark-500">({profile.reviews_count})</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="card p-5 space-y-3"
          >
            <h3 className="font-semibold text-dark-100 text-sm">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((s) => (
                <span key={s.id} className="badge badge-primary">{s.name}</span>
              ))}
              {isOwnProfile && (
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  className="px-3 py-1.5 rounded-xl border border-dashed border-dark-600 bg-transparent text-xs text-dark-400 focus:outline-none focus:border-primary-500 w-32"
                  placeholder="+ Add skill"
                />
              )}
              {!profile.skills?.length && !isOwnProfile && (
                <p className="text-sm text-dark-500">No skills listed</p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'portfolio' && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="card p-5"
          >
            <h3 className="font-semibold text-dark-100 text-sm mb-4">Portfolio</h3>
            {profile.portfolios?.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {profile.portfolios.map((p) => (
                  <div key={p.id} className="rounded-xl overflow-hidden border border-dark-700 bg-dark-800/50">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.title} className="w-full h-32 object-cover" />
                    )}
                    <div className="p-3.5">
                      <h4 className="font-medium text-dark-100 text-sm">{p.title}</h4>
                      {p.description && <p className="text-xs text-dark-400 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" strokeWidth={2} />
                            View project
                          </a>
                        )}
                        {isOwnProfile && (
                          <button
                            onClick={() => removePortfolio(p.id)}
                            className="text-xs text-dark-500 hover:text-red-400 flex items-center gap-1 transition-colors ml-auto"
                          >
                            <Trash2 className="w-3 h-3" strokeWidth={2} />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Briefcase className="w-8 h-8 text-dark-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-dark-500">No portfolio items yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="card p-5"
          >
            {/* Reviews header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-dark-100 text-sm">
                  Reviews
                  <span className="text-dark-500 font-normal ml-1">({profile.reviews_count || 0})</span>
                </h3>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <StarDisplay rating={avgRating} size="md" />
                    <span className="text-xs text-dark-500">average</span>
                  </div>
                )}
              </div>
              {canReview && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowReviewModal(true)}
                  className="btn btn-primary btn-sm gap-1.5"
                >
                  <Star className="w-3.5 h-3.5" strokeWidth={2} />
                  Write a Review
                </motion.button>
              )}
              {!isOwnProfile && alreadyReviewed && (
                <span className="text-xs text-dark-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" strokeWidth={0} />
                  You reviewed this freelancer
                </span>
              )}
            </div>

            {/* Review list */}
            {profile.reviews?.length > 0 ? (
              <div className="space-y-5">
                {profile.reviews.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pb-5 border-b border-dark-800 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={r.reviewer?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.reviewer?.name || 'U')}&background=6366f1&color=fff`}
                        alt={r.reviewer?.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm font-medium text-dark-100">{r.reviewer?.name}</span>
                          <div className="flex items-center gap-2">
                            <StarDisplay rating={r.rating} />
                            {user?.id === r.reviewer?.id && (
                              <button
                                onClick={() => deleteReview(r.id)}
                                className="p-1 rounded text-dark-600 hover:text-red-400 transition-colors"
                                title="Delete review"
                              >
                                <Trash2 className="w-3 h-3" strokeWidth={2} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-dark-600 mt-0.5">
                          {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-dark-300 leading-relaxed">{r.comment}</p>}
                    {r.breakdown && Object.values(r.breakdown).some((v) => v > 0) && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {[
                          { key: 'communication', label: 'Communication' },
                          { key: 'quality',       label: 'Quality' },
                          { key: 'timeliness',    label: 'Timeliness' },
                        ].filter(({ key }) => r.breakdown[key] > 0).map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-1.5 text-xs text-dark-500">
                            <span>{label}</span>
                            <StarDisplay rating={r.breakdown[key]} size="sm" />
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Star className="w-8 h-8 text-dark-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-dark-500">No reviews yet</p>
                {canReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Be the first to review
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review modal */}
      {showReviewModal && (
        <ReviewModal
          freelancer={profile}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
