import { useEffect, useState } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { api } from '../../api';

const fmt = (iso) => new Date(iso).toLocaleString();

const ICON_BY_TYPE = {
  'milestone.created':   '➕',
  'milestone.updated':   '✏️',
  'milestone.deleted':   '🗑️',
  'milestone.submitted': '📤',
  'milestone.approved':  '✅',
  'milestone.rejected':  '❌',
  'file.uploaded':       '📎',
  'file.versioned':      '🆕',
  'file.deleted':        '🗑️',
  'time.started':        '▶️',
  'time.stopped':        '⏹️',
  'extension.requested': '📅',
  'extension.accepted':  '✅',
  'extension.rejected':  '❌',
};

export default function ActivityTab({ contract }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.contracts.activity(contract.id)
      .then(r => setRows(r.data.data))
      .finally(() => setLoading(false));
  }, [contract.id]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-primary-500 animate-spin" /></div>;
  }
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-dark-500">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">No activity yet.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {rows.map(r => (
        <li key={r.id} className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-base">
            {ICON_BY_TYPE[r.type] || '•'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-xs">
              <span className="font-semibold text-dark-100">{r.actor?.name || 'System'}</span>
              <span className="text-dark-400"> · {r.type.replace(/\./g, ' ')}</span>
            </div>
            <div className="text-2xs text-dark-500 mt-0.5">{fmt(r.created_at)}</div>
            {r.data && Object.keys(r.data).length > 0 && (
              <pre className="text-2xs text-dark-400 mt-1 font-mono whitespace-pre-wrap bg-dark-900/40 rounded p-2 border border-dark-800">
                {JSON.stringify(r.data, null, 0)}
              </pre>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
