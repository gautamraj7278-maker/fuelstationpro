import { useEffect, useMemo, useState } from 'react';
import { Plus, Ruler, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import { Field, Input, Select } from '../../components/ui/Field';
import { Loading, ErrorState } from '../../components/ui/States';
import { apiDelete, apiGet, apiPost, apiPut, fmtNum, fmtDate } from '../../lib/api';
import { interpolateVolume } from '../../lib/interp';

type ReadingType = 'opening' | 'closing' | 'unloading_before' | 'unloading_after';

type TankEntry = {
  tank_id: number;
  tank_name: string;
  product_name: string;
  dip_mm: string;
  existing_volume: number | null;
};

export default function DipReadings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tanks, setTanks] = useState<any[]>([]);
  const [pointsCache, setPointsCache] = useState<Record<string, any[]>>({});
  const [readings, setReadings] = useState<any[]>([]);
  const [businessDate, setBusinessDate] = useState(new Date().toISOString().slice(0, 10));

  const [open, setOpen] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Bulk form state
  const [bulkType, setBulkType] = useState<ReadingType>('closing');
  const [tankEntries, setTankEntries] = useState<TankEntry[]>([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, r] = await Promise.all([apiGet('/api/tanks'), apiGet('/api/dip-readings')]);
      setTanks(t || []);
      setReadings(r || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load dip readings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadPointsForTank = async (tankId: number) => {
    if (pointsCache[String(tankId)]) return pointsCache[String(tankId)];
    try {
      const resp = await apiGet(`/api/tanks/${tankId}/calibration`);
      const points = resp?.points || [];
      setPointsCache((prev) => ({ ...prev, [String(tankId)]: points }));
      return points;
    } catch {
      return [];
    }
  };

  const computedVolume = (tankId: number, dipMm: string) => {
    const dip = Number(dipMm);
    if (!Number.isFinite(dip) || dip === 0) return null;
    const points = pointsCache[String(tankId)] || [];
    return interpolateVolume(points, dip);
  };

  const readingsForDate = useMemo(
    () => readings.filter((r) => r.reading_date === businessDate),
    [readings, businessDate],
  );
  const closingByTank = useMemo(() => {
    const map = new Map<string, any>();
    readingsForDate.forEach((r) => {
      if (r.reading_type === 'closing') map.set(r.tank_name, r);
    });
    return map;
  }, [readingsForDate]);

  // Bulk create: open modal listing all tanks
  const openBulkCreate = async () => {
    setEditingId(null);
    setBulkType('closing');
    setFormErr('');

    // Pre-load calibration points for all tanks
    const entries: TankEntry[] = [];
    for (const t of tanks) {
      const existing = closingByTank.get(t.name);
      await loadPointsForTank(t.id);
      entries.push({
        tank_id: t.id,
        tank_name: t.name,
        product_name: t.product_name || '',
        dip_mm: existing ? String(existing.dip_mm ?? '') : '',
        existing_volume: existing ? Number(existing.volume_liters) : null,
      });
    }
    setTankEntries(entries);
    setOpen(true);
  };

  const updateTankDip = (tankId: number, value: string) => {
    setTankEntries((prev) =>
      prev.map((e) => (e.tank_id === tankId ? { ...e, dip_mm: value } : e)),
    );
  };

  // Save all non-empty tank entries at once
  const saveBulk = async () => {
    setFormErr('');
    const filled = tankEntries.filter((e) => e.dip_mm !== '' && Number(e.dip_mm) >= 0);
    if (filled.length === 0) {
      setFormErr('Enter dip reading for at least one tank');
      return;
    }
    setSaving(true);
    try {
      await apiPost('/api/dip-readings', filled.map((e) => ({
        reading_date: businessDate,
        tank_name: e.tank_name,
        dip_mm: Number(e.dip_mm),
        reading_type: bulkType,
      })));
      closeModal();
      await load();
    } catch (e: any) {
      setFormErr(e.message || 'Failed to save dip readings');
    } finally {
      setSaving(false);
    }
  };

  // Single entry edit (individual row edit)
  const openEdit = async (reading: any) => {
    setEditingId(Number(reading.id));
    setBulkType(reading.reading_type as ReadingType);
    setFormErr('');

    const entries: TankEntry[] = [];
    for (const t of tanks) {
      await loadPointsForTank(t.id);
      const isCurrent = t.name === reading.tank_name;
      entries.push({
        tank_id: t.id,
        tank_name: t.name,
        product_name: t.product_name || '',
        dip_mm: isCurrent ? String(reading.dip_mm ?? '') : '',
        existing_volume: null,
      });
    }
    setTankEntries(entries);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setFormErr('');
  };

  const saveEdit = async () => {
    setFormErr('');
    const filled = tankEntries.filter((e) => e.dip_mm !== '' && Number(e.dip_mm) >= 0);
    if (filled.length === 0) {
      setFormErr('Enter dip reading for at least one tank');
      return;
    }
    setSaving(true);
    try {
      // For editing, only save the one with a value (the editing row)
      const target = filled[0];
      if (!target) return;
      await apiPut('/api/dip-readings', {
        id: editingId,
        reading_date: businessDate,
        tank_name: target.tank_name,
        dip_mm: Number(target.dip_mm),
        reading_type: bulkType,
      });
      closeModal();
      await load();
    } catch (e: any) {
      setFormErr(e.message || 'Failed to save dip reading');
    } finally {
      setSaving(false);
    }
  };

  const deleteReading = async (reading: any) => {
    try {
      await apiDelete('/api/dip-readings', { id: reading.id });
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to delete dip reading');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Daily Stock Closing</h1>
          <p className="text-sm text-slate-400 mt-0.5">Record tank dip readings, compute physical closing volume from calibration, and save it for loss/gain analysis</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="w-44">
            <Field label="Business Date">
              <Input type="date" value={businessDate} onChange={(e) => setBusinessDate(e.target.value)} />
            </Field>
          </div>
          <button onClick={openBulkCreate} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Record Dip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs text-slate-400">Tanks Closed</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{closingByTank.size} / {tanks.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-slate-400">Physical Closing Volume</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{fmtNum(Array.from(closingByTank.values()).reduce((s, r) => s + Number(r.volume_liters || 0), 0), 1)} L</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-slate-400">Mode</div>
          <div className="text-sm font-medium text-slate-700 mt-2">Only closing dip updates the tank's saved physical stock</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Tank</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Dip (mm)</th>
                <th className="px-4 py-3 text-right">Volume (L)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {readingsForDate.slice().reverse().map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(r.reading_date)}</td>
                  <td className="px-4 py-3 text-slate-700">{r.tank_name}</td>
                  <td className="px-4 py-3 text-slate-600">{String(r.reading_type || '').replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtNum(r.dip_mm, 1)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">{fmtNum(r.volume_liters, 1)} L</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {readingsForDate.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No dip readings recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bulk Tank Dip Modal */}
      <Modal open={open} onClose={closeModal} title={editingId ? 'Edit Dip Reading' : 'Record Dip Readings — All Tanks'} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date" required>
              <Input type="date" value={businessDate} onChange={() => {}} disabled />
            </Field>
            <Field label="Type" required>
              <Select value={bulkType} onChange={(e) => setBulkType(e.target.value as ReadingType)}>
                <option value="opening">Opening</option>
                <option value="closing">Closing</option>
                <option value="unloading_before">Before Unloading</option>
                <option value="unloading_after">After Unloading</option>
              </Select>
            </Field>
          </div>

          <p className="text-xs text-slate-500">Enter dip reading (mm) for each tank. Tanks left blank will be skipped. Computed volumes update automatically from calibration data.</p>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Tank Name</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Dip (mm)</th>
                  <th className="px-3 py-2 text-right">Volume (L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tankEntries.map((entry) => {
                  const vol = computedVolume(entry.tank_id, entry.dip_mm);
                  return (
                    <tr key={entry.tank_id} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 font-medium text-slate-700">{entry.tank_name}</td>
                      <td className="px-3 py-2 text-slate-500">{entry.product_name}</td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="w-28 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={entry.dip_mm}
                          onChange={(e) => updateTankDip(entry.tank_id, e.target.value)}
                          placeholder="—"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        {vol != null ? (
                          <span className="font-semibold text-emerald-700">{fmtNum(vol, 1)} L</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {tankEntries.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">No tanks configured</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary of what will be saved */}
          {(() => {
            const filledCount = tankEntries.filter((e) => e.dip_mm !== '' && Number(e.dip_mm) >= 0).length;
            const totalVol = tankEntries.reduce((s, e) => {
              const v = computedVolume(e.tank_id, e.dip_mm);
              return s + (v ?? 0);
            }, 0);
            if (filledCount === 0) return null;
            return (
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
                <Ruler className="w-4 h-4 flex-shrink-0" />
                <span>{filledCount} tank{filledCount !== 1 ? 's' : ''} will be saved &middot; Total computed volume: <strong>{fmtNum(totalVol, 1)} L</strong></span>
              </div>
            );
          })()}

          {formErr && <p className="text-sm text-rose-600">{formErr}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button
              onClick={editingId ? saveEdit : saveBulk}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Save All'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteReading(deleteTarget)}
        title="Delete Dip Reading"
        message={deleteTarget ? `Delete the ${String(deleteTarget.reading_type || '').replace('_', ' ')} dip for ${deleteTarget.tank_name} on ${fmtDate(deleteTarget.reading_date)}?` : ''}
      />
    </div>
  );
}
