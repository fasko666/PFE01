import { useEffect, useState } from 'react';
import { Play, Square, Clock, Image as ImageIcon } from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const fmtSecs = (s) => {
  s = Number(s||0);
  const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); const ss = s%60;
  return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
};
const fmtDate = (iso) => new Date(iso).toLocaleString();

export default function TimeTrackingTab({ contract }) {
  const { user } = useAuthStore();
  const isFreelancer = Number(user.id) === Number(contract.freelancer_id);

  const [logs, setLogs] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [running, setRunning] = useState(null);
  const [tick, setTick] = useState(0);
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState('');

  const load = async () => {
    try {
      const [a, b] = await Promise.all([api.contracts.timeLogs(contract.id), api.contracts.timeWeekly(contract.id)]);
      const all = a.data.data?.data || a.data.data || [];
      setLogs(all);
      setRunning(all.find(l => !l.ended_at));
      setWeekly(b.data.data);
    } catch { toast.error('Failed to load time logs'); }
  };
  useEffect(() => { load(); }, [contract.id]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTick(x => x+1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const start = async () => {
    try { await api.contracts.timeStart(contract.id, { description }); await load(); setDescription(''); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };
  const stop = async () => {
    try { await api.contracts.timeStop(contract.id, { description: description || null, screenshot_url: screenshot || null }); await load(); setDescription(''); setScreenshot(''); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  const liveSeconds = running ? Math.max(0, Math.floor((Date.now() - new Date(running.started_at).getTime())/1000)) : 0;
  const totalSeconds = logs.filter(l=>l.ended_at).reduce((a,l)=>a+(l.duration_seconds||0),0);

  return (
    <div className="space-y-4">
      {isFreelancer && (
        <div className="rounded-2xl border border-dark-800 bg-dark-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${running ? 'text-green-400 animate-pulse' : 'text-dark-500'}`} />
              <div>
                <div className="text-xs font-bold text-dark-100">{running ? 'Timer running' : 'Timer stopped'}</div>
                <div className="text-2xs text-dark-500 font-mono">{fmtSecs(liveSeconds + (tick&0))}</div>
              </div>
            </div>
            {running ? (
              <button onClick={stop} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold">
                <Square className="w-3.5 h-3.5" /> Stop
              </button>
            ) : (
              <button onClick={start} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold">
                <Play className="w-3.5 h-3.5" /> Start
              </button>
            )}
          </div>
          <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="What are you working on?" className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-100" />
          {running && (
            <input value={screenshot} onChange={e=>setScreenshot(e.target.value)} placeholder="Screenshot URL (optional)" className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-xs text-dark-100" />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-dark-800 bg-dark-900 p-4">
          <div className="text-2xs text-dark-500 uppercase tracking-wider">Total hours</div>
          <div className="text-2xl font-bold text-dark-100 mt-1 font-mono">{(totalSeconds/3600).toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-dark-800 bg-dark-900 p-4">
          <div className="text-2xs text-dark-500 uppercase tracking-wider">Total sessions</div>
          <div className="text-2xl font-bold text-dark-100 mt-1">{logs.filter(l=>l.ended_at).length}</div>
        </div>
      </div>

      {weekly.length > 0 && (
        <div className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden">
          <div className="px-4 py-2 border-b border-dark-800 text-2xs font-bold uppercase tracking-wider text-dark-100">Weekly</div>
          <ul className="divide-y divide-dark-800">
            {weekly.map(w => (
              <li key={w.iso_week} className="px-4 py-2 flex items-center justify-between text-xs">
                <span className="text-dark-300 font-mono">Week {w.iso_week}</span>
                <span className="text-dark-100 font-semibold">{(w.total_seconds/3600).toFixed(2)} h</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-dark-800 bg-dark-900 overflow-hidden">
        <div className="px-4 py-2 border-b border-dark-800 text-2xs font-bold uppercase tracking-wider text-dark-100">Recent logs</div>
        {logs.length === 0 ? (
          <p className="text-xs text-dark-500 italic p-4">No logs yet.</p>
        ) : (
          <ul className="divide-y divide-dark-800 max-h-96 overflow-y-auto">
            {logs.filter(l=>l.ended_at).map(l => (
              <li key={l.id} className="px-4 py-2 text-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-dark-200 font-semibold">{l.description || '(no description)'}</span>
                  <span className="text-dark-300 font-mono">{fmtSecs(l.duration_seconds)}</span>
                </div>
                <div className="text-dark-500 mt-0.5 flex items-center gap-2">
                  {fmtDate(l.started_at)}
                  {l.screenshot_url && <a href={l.screenshot_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-400 hover:underline"><ImageIcon className="w-3 h-3" /> screenshot</a>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
