import { useEffect, useState, useMemo, useCallback } from 'react';
import { ClipboardList, Filter, Plus, Pencil, Trash2, CheckSquare, Square, CheckCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Field, Input, Select } from '../../components/ui/Field';
import { ConfirmModal } from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { apiGet, apiPost, apiPut, apiDelete, fmtMoney, fmtDate } from '../../lib/api';

type SettlementStatus = 'open' | 'settled';

export default function OperatorSalesManagement() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterOperator, setFilterOperator] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Master data for filter dropdowns
  const [masterOperators, setMasterOperators] = useState<string[]>([]);
  const [masterShifts, setMasterShifts] = useState<string[]>([]);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkSettling, setBulkSettling] = useState(false);

  // Create/Edit modal
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    id: 0,
    sale_date: new Date().toISOString().slice(0, 10),
    shift_name: '',
    operator_name: '',
    dispenser_name: '',
    total_sales_amount: '0',
    submitted_amount: '0',
    exemptions: '0',
    status: 'open' as SettlementStatus,
    remarks: '',
  });
  const [formErr, setFormErr] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const loadMasters = useCallback(async () => {
    try {
      const [ops, shifts] = await Promise.all([
        apiGet<any[]>('/api/operators'),
        apiGet<any[]>('/api/shifts'),
      ]);
      setMasterOperators((ops || []).map((o: any) => o.name).sort());
      setMasterShifts((shifts || []).map((s: any) => s.name).sort());
    } catch (_) { /* non-critical */ }
  }, []);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (filterOperator) params.set('operator_name', filterOperator);
    if (filterShift) params.set('shift_name', filterShift);
    if (filterStatus) params.set('status', filterStatus);
    return params.toString();
  }, [dateFrom, dateTo, filterOperator, filterShift, filterStatus]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = buildQueryString();
      const res = await apiGet(`/api/operator-sales${qs ? `?${qs}` : ''}`);
      setSettlements(Array.isArray(res) ? res : res.data || []);
      setSelectedIds(new Set());
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  useEffect(() => { loadMasters(); }, [loadMasters]);
  useEffect(() => { load(); }, [load]);

  // Derived totals (from all loaded data)
  const totals = useMemo(() => {
    let totalSales = 0, totalSubmitted = 0, totalVariance = 0, totalExemptions = 0, totalDeductible = 0;
    for (const s of settlements) {
      totalSales += Number(s.total_sales_amount || 0);
      totalSubmitted += Number(s.submitted_amount || 0);
      totalVariance += Number(s.variance || 0);
      totalExemptions += Number(s.exemptions || 0);
      totalDeductible += Number(s.total_deductible || 0);
    }
    return { totalSales, totalSubmitted, totalVariance, totalExemptions, totalDeductible };
  }, [settlements]);

  // Paginated slice for display
  const totalPages = Math.max(1, Math.ceil(settlements.length / pageSize));
  const totalEntries = settlements.length;
  const paginatedSettlements = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize;
    return settlements.slice(from, to);
  }, [settlements, currentPage, pageSize]);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

  // ── Bulk Selection ──
  const allPageSelected = paginatedSettlements.length > 0 && paginatedSettlements.every((s) => selectedIds.has(s.id));
  const somePageSelected = paginatedSettlements.some((s) => selectedIds.has(s.id)) && !allPageSelected;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPageSelected) {
      // Deselect all on current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedSettlements.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      // Select all on current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedSettlements.forEach((s) => next.add(s.id));
        return next;
      });
    }
  };

  const handleBulkSettle = async () => {
    if (selectedIds.size === 0) return;
    setBulkSettling(true);
    try {
      await apiPost('/api/operator-sales/bulk-settle', { ids: [...selectedIds] });
      setSuccess(`${selectedIds.size} settlement(s) marked as settled`);
      setSelectedIds(new Set());
      await load();
    } catch (e: any) {
      setError(e.message || 'Bulk settle failed');
    } finally {
      setBulkSettling(false);
    }
  };

  // Open create form
  const openCreate = () => {
    setFormData({
      id: 0, sale_date: new Date().toISOString().slice(0, 10),
      shift_name: '', operator_name: '', dispenser_name: '',
      total_sales_amount: '0', submitted_amount: '0',
      exemptions: '0', status: 'open', remarks: '',
    });
    setFormMode('create');
    setFormErr('');
    setShowForm(true);
  };

  // Open edit form
  const openEdit = (s: any) => {
    setFormData({
      id: s.id,
      sale_date: s.sale_date,
      shift_name: s.shift_name || '',
      operator_name: s.operator_name || '',
      dispenser_name: s.dispenser_name || '',
      total_sales_amount: String(s.total_sales_amount || '0'),
      submitted_amount: String(s.submitted_amount || '0'),
      exemptions: String(s.exemptions || '0'),
      status: s.status || 'open',
      remarks: s.remarks || '',
    });
    setFormMode('edit');
    setFormErr('');
    setShowForm(true);
  };

  // Computed total deductible for the form: ABS(variance) - ABS(exemptions)
  const formTotalDeductible = useMemo(() => {
    const variance = Math.abs(Number(formData.submitted_amount) - Number(formData.total_sales_amount));
    const exemptions = Math.abs(Number(formData.exemptions) || 0);
    return Math.max(0, variance - exemptions);
  }, [formData.total_sales_amount, formData.submitted_amount, formData.exemptions]);

  // Save (create or update)
  const handleSave = async () => {
    setFormErr('');
    if (!formData.sale_date) { setFormErr('Sale date is required'); return; }
    if (!formData.shift_name) { setFormErr('Shift is required'); return; }
    if (!formData.operator_name) { setFormErr('Operator is required'); return; }
    if (!formData.dispenser_name) { setFormErr('Dispenser is required'); return; }

    setFormSaving(true);
    try {
      if (formMode === 'create') {
        await apiPost('/api/operator-sales', {
          sale_date: formData.sale_date,
          shift_name: formData.shift_name,
          operator_name: formData.operator_name,
          dispenser_name: formData.dispenser_name,
          total_sales_amount: Number(formData.total_sales_amount),
          submitted_amount: Number(formData.submitted_amount),
          exemptions: Number(formData.exemptions),
          status: formData.status,
          remarks: formData.remarks,
        });
      } else {
        await apiPut('/api/operator-sales', {
          id: formData.id,
          exemptions: Number(formData.exemptions),
          status: formData.status,
          remarks: formData.remarks,
        });
      }
      setShowForm(false);
      setSuccess(formMode === 'create' ? 'Settlement created successfully' : 'Settlement updated successfully');
      await load();
    } catch (e: any) {
      setFormErr(e.message || 'Failed to save');
    } finally {
      setFormSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete('/api/operator-sales', { id: deleteTarget.id });
      setDeleteTarget(null);
      setSuccess('Settlement deleted successfully');
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to delete');
    }
  };

  // Quick settle/unsettle toggle
  const toggleStatus = async (s: any) => {
    try {
      const newStatus = s.status === 'settled' ? 'open' : 'settled';
      await apiPut('/api/operator-sales', { id: s.id, status: newStatus });
      setSuccess(`Settlement ${newStatus === 'settled' ? 'closed' : 're-opened'}`);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">{error} <button onClick={() => { setError(''); load(); }} className="underline ml-2">Retry</button></div>}
      {success && <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm">{success} <button onClick={() => setSuccess('')} className="underline ml-2">Dismiss</button></div>}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-indigo-600" /> Operator Sales Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage operator sales, exemptions, and close-out</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Settlement
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Field label="Date From">
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); handleFilterChange(); }} />
          </Field>
          <Field label="Date To">
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); handleFilterChange(); }} />
          </Field>
          <Field label="Operator">
            <Select value={filterOperator} onChange={(e) => { setFilterOperator(e.target.value); handleFilterChange(); }}>
              <option value="">All Operators</option>
              {masterOperators.map((o) => <option key={o} value={o}>{o}</option>)}
            </Select>
          </Field>
          <Field label="Shift">
            <Select value={filterShift} onChange={(e) => { setFilterShift(e.target.value); handleFilterChange(); }}>
              <option value="">All Shifts</option>
              {masterShifts.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange(); }}>
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="settled">Settled</option>
            </Select>
          </Field>
        </div>
      </Card>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Sales (Meter)</div>
          <div className="text-lg font-bold text-slate-800 mt-0.5">{fmtMoney(totals.totalSales)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Submitted</div>
          <div className="text-lg font-bold text-slate-800 mt-0.5">{fmtMoney(totals.totalSubmitted)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Variance</div>
          <div className={`text-lg font-bold mt-0.5 ${totals.totalVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totals.totalVariance >= 0 ? '+' : ''}{fmtMoney(totals.totalVariance)}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Exemptions</div>
          <div className="text-lg font-bold text-amber-600 mt-0.5">{fmtMoney(totals.totalExemptions)}</div>
        </Card>
        <Card className="p-3 border-2 border-rose-200 bg-rose-50">
          <div className="text-[10px] text-rose-500 uppercase tracking-wider">Total Deductible</div>
          <div className="text-lg font-bold text-rose-700 mt-0.5">{fmtMoney(totals.totalDeductible)}</div>
        </Card>
      </div>

      {/* ── Bulk Settle Bar ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
          <span className="text-sm text-indigo-700 font-medium">{selectedIds.size} record(s) selected</span>
          <button
            onClick={handleBulkSettle}
            disabled={bulkSettling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            <CheckCheck className="w-4 h-4" /> {bulkSettling ? 'Settling...' : 'Mark Selected as Settled'}
          </button>
        </div>
      )}

      {/* ── Settlements Table ── */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Settlement Records {totalEntries > 0 && <span className="text-slate-400 font-normal">({totalEntries})</span>}
        </h3>
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
        ) : settlements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">No settlement records found</p>
            <p className="text-xs text-slate-400 mt-1">Settlements are auto-created when daily sales entries are made with an operator assigned. Use <strong>Add Settlement</strong> to create one manually.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs">
                  <tr>
                    <th className="px-3 py-2 text-center w-10">
                      <button onClick={toggleSelectAll} className="p-0.5 rounded hover:bg-slate-200" title="Select all on page">
                        {allPageSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : somePageSelected ? <Square className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </button>
                    </th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Shift</th>
                    <th className="px-3 py-2 text-left">Operator</th>
                    <th className="px-3 py-2 text-right">Meter Sales</th>
                    <th className="px-3 py-2 text-right">Amount Submitted</th>
                    <th className="px-3 py-2 text-right">Variance</th>
                    <th className="px-3 py-2 text-right">Exemptions</th>
                    <th className="px-3 py-2 text-right">Total Deductible</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-left">Remarks</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedSettlements.map((s) => {
                    const absVariance = Math.abs(Number(s.variance || 0));
                    const absExemptions = Math.abs(Number(s.exemptions || 0));
                    const totalDeductible = Math.max(0, absVariance - absExemptions);
                    return (
                      <tr key={s.id} className={`hover:bg-slate-50 ${selectedIds.has(s.id) ? 'bg-indigo-50/50' : ''}`}>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => toggleSelect(s.id)} className="p-0.5 rounded hover:bg-slate-200">
                            {selectedIds.has(s.id) ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                          </button>
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">{fmtDate(s.sale_date)}</td>
                        <td className="px-3 py-2 text-slate-600">{s.shift_name}</td>
                        <td className="px-3 py-2 text-slate-700 font-medium">{s.operator_name}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{fmtMoney(s.total_sales_amount)}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{fmtMoney(s.submitted_amount)}</td>
                        <td className={`px-3 py-2 text-right font-medium ${Number(s.variance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {Number(s.variance || 0) >= 0 ? '+' : ''}{fmtMoney(s.variance)}
                        </td>
                        <td className="px-3 py-2 text-right text-amber-600">{fmtMoney(s.exemptions || 0)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-rose-700">{fmtMoney(totalDeductible)}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => toggleStatus(s)}
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                              s.status === 'settled' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {s.status === 'settled' ? 'Settled' : 'Open'}
                          </button>
                        </td>
                        <td className="px-3 py-2 text-slate-500 text-xs max-w-[140px] truncate">{s.remarks || '—'}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => openEdit(s)} className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalEntries}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </Card>

      {/* ── Create/Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800">{formMode === 'create' ? 'New Settlement' : 'Edit Settlement'}</h3>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Date" required>
                <Input type="date" value={formData.sale_date} onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })} disabled={formMode === 'edit'} />
              </Field>
              <Field label="Status">
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as SettlementStatus })}>
                  <option value="open">Open</option>
                  <option value="settled">Settled</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Shift" required>
                <Select value={formData.shift_name} onChange={(e) => setFormData({ ...formData, shift_name: e.target.value })} disabled={formMode === 'edit'}>
                  <option value="">Select</option>
                  {masterShifts.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Operator" required>
                <Select value={formData.operator_name} onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })} disabled={formMode === 'edit'}>
                  <option value="">Select</option>
                  {masterOperators.map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              </Field>
              <Field label="Dispenser" required>
                <Input value={formData.dispenser_name} onChange={(e) => setFormData({ ...formData, dispenser_name: e.target.value })} disabled={formMode === 'edit'} placeholder="e.g. D1" />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Meter Sales">
                <Input type="number" step="0.01" value={formData.total_sales_amount} onChange={(e) => setFormData({ ...formData, total_sales_amount: e.target.value })} disabled={formMode === 'edit'} />
              </Field>
              <Field label="Amount Submitted" required>
                <Input type="number" step="0.01" value={formData.submitted_amount} onChange={(e) => setFormData({ ...formData, submitted_amount: e.target.value })} />
              </Field>
              <Field label="Exemptions">
                <Input type="number" step="0.01" value={formData.exemptions} onChange={(e) => setFormData({ ...formData, exemptions: e.target.value })} />
              </Field>
            </div>

            <div className="flex items-center justify-between bg-rose-50 rounded-lg px-4 py-2">
              <span className="text-sm font-semibold text-slate-700">Total Deductible:</span>
              <span className="text-lg font-bold text-rose-700">{fmtMoney(formTotalDeductible)}</span>
            </div>
            <p className="text-[10px] text-slate-400">Total Deductible = |Variance| − |Exemptions|</p>

            <Field label="Remarks">
              <Input value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder="Optional remarks" />
            </Field>

            {formErr && <p className="text-sm text-rose-600">{formErr}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
              <button onClick={handleSave} disabled={formSaving} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60">
                {formSaving ? 'Saving...' : formMode === 'create' ? 'Create Settlement' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Settlement"
        message={deleteTarget ? `Are you sure you want to delete the settlement for ${deleteTarget.operator_name} on ${fmtDate(deleteTarget.sale_date)} (${deleteTarget.shift_name}, ${deleteTarget.dispenser_name})?` : ''}
      />
    </div>
  );
}
