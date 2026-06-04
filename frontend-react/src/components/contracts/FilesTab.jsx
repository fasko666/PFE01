import { useEffect, useRef, useState } from 'react';
import { Upload, Download, Trash2, FileIcon, History, Loader2 } from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const fmtSize = (n) => {
  if (!n) return '0 B';
  const k = 1024; const sizes = ['B','KB','MB','GB']; const i = Math.floor(Math.log(n)/Math.log(k));
  return `${(n/Math.pow(k,i)).toFixed(1)} ${sizes[i]}`;
};
const fmtDate = (iso) => new Date(iso).toLocaleDateString();

export default function FilesTab({ contract }) {
  const { user } = useAuthStore();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const inputRef = useRef();
  const versionInputRef = useRef();
  const [versioningId, setVersioningId] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.contracts.files(contract.id); setFiles(data.data); }
    catch { toast.error('Failed to load files'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [contract.id]);

  const upload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', f);
    try { await api.contracts.uploadFile(contract.id, fd); await load(); toast.success('File uploaded'); }
    catch (err) { toast.error(err?.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const uploadVersion = async (e) => {
    const f = e.target.files?.[0]; if (!f || !versioningId) return;
    const fd = new FormData(); fd.append('file', f);
    try { await api.contracts.uploadFileVersion(versioningId, fd); await load(); toast.success('New version uploaded'); }
    catch (err) { toast.error(err?.response?.data?.message || 'Upload failed'); }
    finally { setVersioningId(null); e.target.value = ''; }
  };

  const remove = async (f) => {
    if (!confirm(`Delete ${f.original_name}?`)) return;
    try { await api.contracts.deleteFile(f.id); await load(); toast.success('Deleted'); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-3">
      <button onClick={() => inputRef.current?.click()} disabled={uploading}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold disabled:opacity-40">
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        Upload file
      </button>
      <input ref={inputRef} type="file" onChange={upload} className="hidden" />
      <input ref={versionInputRef} type="file" onChange={uploadVersion} className="hidden" />

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-primary-500 animate-spin" /></div>
      ) : files.length === 0 ? (
        <p className="text-xs text-dark-500 italic">No files yet.</p>
      ) : (
        <ul className="space-y-2">
          {files.map(f => (
            <li key={f.id} className="rounded-xl border border-dark-800 bg-dark-900 p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center">
                  <FileIcon className="w-4 h-4 text-dark-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-dark-100 truncate">{f.original_name}</div>
                  <div className="text-2xs text-dark-500">v{f.version} · {fmtSize(f.size_bytes)} · {f.uploader?.name || 'Unknown'} · {fmtDate(f.created_at)}</div>
                </div>
                <div className="flex gap-1">
                  <a href={api.contracts.downloadFileUrl(f.id) + `?token=${encodeURIComponent(localStorage.getItem('panda_token')||'')}`}
                    onClick={async (e) => {
                      e.preventDefault();
                      // Trigger download via fetch with Bearer header
                      try {
                        const res = await fetch(api.contracts.downloadFileUrl(f.id), {
                          headers: { Authorization: `Bearer ${localStorage.getItem('panda_token')||''}` },
                        });
                        if (!res.ok) throw new Error();
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href=url; a.download=f.original_name; a.click(); URL.revokeObjectURL(url);
                      } catch { toast.error('Download failed'); }
                    }}
                    className="w-7 h-7 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-300 hover:text-white" title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  {(f.versions?.length > 0) && (
                    <button onClick={() => setExpanded(s => ({ ...s, [f.id]: !s[f.id] }))} className="w-7 h-7 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-300 hover:text-white" title="Versions">
                      <History className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => { setVersioningId(f.id); versionInputRef.current?.click(); }} className="px-2 h-7 rounded-lg bg-dark-800 border border-dark-700 text-2xs text-dark-300 hover:text-white" title="Upload new version">
                    +v
                  </button>
                  {(Number(f.uploader_id) === Number(user.id) || user.role === 'admin') && (
                    <button onClick={() => remove(f)} className="w-7 h-7 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-300 hover:text-red-400" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {expanded[f.id] && f.versions?.length > 0 && (
                <ul className="mt-3 ml-12 space-y-1 border-l border-dark-700 pl-3">
                  {f.versions.map(v => (
                    <li key={v.id} className="text-2xs text-dark-400 flex items-center gap-2">
                      v{v.version} · {fmtSize(v.size_bytes)} · {fmtDate(v.created_at)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
