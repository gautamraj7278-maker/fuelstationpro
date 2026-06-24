import { useEffect, useMemo, useState, useCallback } from 'react';
import { Download, Filter, Truck, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { BarChart } from '../components/Charts';
import { Badge } from '../components/ui/Badge';
import { Loading, ErrorState } from '../components/ui/States';
import { apiGet, fmtMoney, fmtNum, fmtDate } from '../lib/api';
import { toCSV, downloadCSV } from '../lib/csv';

type Period = 'daily' | 'monthly' | 'quarterly' | 'yearly';

export default function TankerUnloadingReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lines, setLines] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('monthly');
  const [productFilter, setProductFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [tankFilter, setTankFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ pageSize: '5000' });
      if (dateFrom) params.set('unload_date_from', dateFrom);
      if (dateTo) params.set('unload_date_to', dateTo);
      const res = await apiGet(`/api/tanker-unloading/batches?${params.toString()}`);
      setLines(res.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const products = useMemo(() => {
    const set = new Set<string>();
    (lines || []).forEach((b) => {
      (b.tanker_unloading_lines || []).forEach((l: any) => { if (l.product_name) set.add(l.product_name); });
    });
    return Array.from(set).sort();
  }, [lines]);

  const suppliers = useMemo(() => {
    return Array.from(new Set((lines || []).map((b) => b.supplier_name).filter(Boolean))).sort();
  }, [lines]);

  const tanks = useMemo(() => {
    const set = new Set<string>();
    (lines || []).forEach((b) => {
      (b.tanker_unloading_lines || []).forEach((l: any) => { if (l.tank_name) set.add(l.tank_name); });
    });
    return Array.from(set).sort();
  }, [lines]);

  const filteredBatches = useMemo(() => {
    return (lines || []).filter((b) => {
      if (supplierFilter !== 'all' && b.supplier_name !== supplierFilter) return false;
      if (productFilter !== 'all') {
        const hasProduct = (b.tanker_unloading_lines || []).some((l: any) => l.product_name === productFilter);
        if (!hasProduct) return false;
      }
      if (tankFilter !== 'all') {
        const hasTank = (b.tanker_unloading_lines || []).some((l: any) => l.tank_name === tankFilter);
        if (!hasTank) return false;
      }
      return true;
    });
  }, [lines, supplierFilter, productFilter, tankFilter]);

  const bucketKey = (d: string) => {
    const date = new Date(d);
    if (period === 'daily') return d.slice(0, 10);
    if (period === 'monthly') return d.slice(0, 7);
    if (period === 'quarterly') return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
    return String(date.getFullYear());
  };

  const grouped = useMemo(() => {
    const m: Record<string, { tanker_qty: number; received: number; variance: number; count: number; positiveVar: number; negativeVar: number }> = {};
    filteredBatches.forEach((b) => {
      const k = bucketKey(b.unload_date || '');
      m[k] = m[k] || { tanker_qty: 0, received: 0, variance: 0, count: 0, positiveVar: 0, negativeVar: 0 };
      const t = b.totals || {};
      const v = Number(t.variance || 0);
      m[k].tanker_qty += Number(t.tanker_qty || 0);
      m[k].received += Number(t.received_volume || 0);
      m[k].variance += v;
      m[k].count++;
      if (v > 0) m[k].positiveVar += v;
      else m[k].negativeVar += Math.abs(v);
    });
    return Object.entries(m).sort().map(([period, v]) => ({ period, ...v }));
  }, [filteredBatches, period]);

  const totalTankerQty = grouped.reduce((s, g) => s + g.tanker_qty, 0);
  const totalReceived = grouped.reduce((s, g) => s + g.received, 0);
  const totalVariance = grouped.reduce((s, g) => s + g.variance, 0);
  const totalPositiveVar = grouped.reduce((s, g) => s + g.positiveVar, 0);
  const totalNegativeVar = grouped.reduce((s, g) => s + g.negativeVar, 0);

  const receivedSeries = grouped.slice(-12).map((g) => ({ label: g.period.slice(-7), value: Math.round(g.received) }));
  const varianceSeries = grouped.slice(-12).map((g) => ({ label: g.period.slice(-7), value: Math.round(g.variance) }));

  const exportReport = () => downloadCSV(`tanker_unloading_${period}.csv`, toCSV(
    grouped.map((g) => ({
      period: g.period,
      tanker_qty_liters: g.tanker_qty.toFixed(2),
      received_liters: g.received.toFixed(2),
      variance_liters: g.variance.toFixed(2),
      entries: g.count,
    }))
  ));

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tanker Unloading Report</h1>
          <p className="text-sm text-slate-400 mt-0.5">Receipt volumes, received quantities, and variance analysis by period</p>
        </div>
        <button onClick={exportReport} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"><Download className="w-4 h-4" /> Export Report</button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600"><Filter className="w-4 h-4" /> Filters</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
            {(['daily', 'monthly', 'quarterly', 'yearly'] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize ${period === p ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{p}</button>
            ))}
          </div>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white" title="Date From" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white" title="Date To" />
          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="all">All Products</option>
            {products.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="all">All Suppliers</option>
            {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={tankFilter} onChange={(e) => setTankFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="all">All Tanks</option>
            {tanks.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5"><div className="text-xs text-slate-400">Total Declared</div><div className="text-2xl font-bold text-slate-800 mt-1">{fmtNum(totalTankerQty, 0)} L</div></Card>
        <Card className="p-5"><div className="text-xs text-slate-400">Total Received</div><div className="text-2xl font-bold text-emerald-600 mt-1">{fmtNum(totalReceived, 0)} L</div></Card>
        <Card className="p-5">
          <div className="text-xs text-slate-400">Net Variance</div>
          <div className={`text-2xl font-bold mt-1 ${totalVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totalVariance >= 0 ? '+' : ''}{fmtNum(totalVariance, 0)} L
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-slate-400">Receipt Periods</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{grouped.length}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Positive Variance (Gain)</div>
          <div className="text-xl font-bold text-emerald-600">+{fmtNum(totalPositiveVar, 0)} L</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1"><TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Negative Variance (Loss)</div>
          <div className="text-xl font-bold text-rose-600">-{fmtNum(totalNegativeVar, 0)} L</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Received Volume" subtitle={`By ${period}`} />
          <div className="p-5">{receivedSeries.length ? <BarChart data={receivedSeries} color="#16a34a" valueFmt={(n) => fmtNum(n, 0) + ' L'} /> : <p className="text-sm text-slate-400 py-8 text-center">No data</p>}</div>
        </Card>
        <Card>
          <CardHeader title="Variance Trend" subtitle={`By ${period}`} />
          <div className="p-5">{varianceSeries.length ? <BarChart data={varianceSeries} color={varianceSeries.some((d) => d.value < 0) ? '#dc2626' : '#16a34a'} valueFmt={(n) => fmtNum(n, 0) + ' L'} /> : <p className="text-sm text-slate-400 py-8 text-center">No data</p>}</div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Period Breakdown" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3 text-right">Entries</th>
                <th className="px-5 py-3 text-right">Tanker Qty (L)</th>
                <th className="px-5 py-3 text-right">Received (L)</th>
                <th className="px-5 py-3 text-right">Variance (L)</th>
                <th className="px-5 py-3 text-right">Var %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {grouped.slice().reverse().map((g) => {
                const varPct = g.tanker_qty > 0 ? (g.variance / g.tanker_qty) * 100 : 0;
                return (
                  <tr key={g.period} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-slate-700">{g.period}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{g.count}</td>
                    <td className="px-5 py-3 text-right text-slate-700">{fmtNum(g.tanker_qty, 0)}</td>
                    <td className="px-5 py-3 text-right text-emerald-600 font-semibold">{fmtNum(g.received, 0)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-semibold ${g.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {g.variance >= 0 ? '+' : ''}{fmtNum(g.variance, 1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Badge color={varPct > 1 ? 'amber' : varPct < -1 ? 'red' : 'green'}>
                        {varPct >= 0 ? '+' : ''}{fmtNum(varPct, 2)}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {grouped.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No tanker unloading data</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="All Unloading Batches" subtitle="Click to expand details" />
        <div className="space-y-2 px-5 pb-5">
          {filteredBatches.map((b) => {
            const t = b.totals || {};
            return (
              <details key={b.id} className="rounded-lg border border-slate-200 group">
                <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-lg [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-medium text-slate-800">{b.tanker_number}</span>
                      <span className="text-slate-400 mx-2">•</span>
                      <span className="text-sm text-slate-500">{fmtDate(b.unload_date)}</span>
                      <span className="text-slate-400 mx-2">•</span>
                      <span className="text-sm text-slate-500">{b.supplier_name || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">{fmtNum(t.tanker_qty, 0)}L → {fmtNum(t.received_volume, 0)}L</span>
                    <span className={`font-semibold ${Number(t.variance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {Number(t.variance || 0) >= 0 ? '+' : ''}{fmtNum(t.variance, 1)}L
                    </span>
                  </div>
                </summary>
                <div className="px-4 pb-3 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div><span className="text-slate-500">Waybill:</span> <span className="font-medium text-slate-700">{b.waybill_no || '—'}</span></div>
                    <div><span className="text-slate-500">Invoice:</span> <span className="font-medium text-slate-700">{b.invoice_no || '—'}</span></div>
                    <div><span className="text-slate-500">Temp:</span> <span className="font-medium text-slate-700">{b.temperature == null ? '—' : fmtNum(b.temperature, 1) + '°C'}</span></div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                        <th className="px-2 py-1">Product</th>
                        <th className="px-2 py-1">Tank</th>
                        <th className="px-2 py-1 text-right">Tanker Qty</th>
                        <th className="px-2 py-1 text-right">Received</th>
                        <th className="px-2 py-1 text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(b.tanker_unloading_lines || []).map((l: any) => (
                        <tr key={l.id}>
                          <td className="px-2 py-1.5 font-medium text-slate-700">{l.product_name}</td>
                          <td className="px-2 py-1.5 text-slate-600">{l.tank_name}</td>
                          <td className="px-2 py-1.5 text-right text-slate-600">{fmtNum(l.tanker_qty, 0)} L</td>
                          <td className="px-2 py-1.5 text-right font-semibold text-emerald-600">{fmtNum(l.received_volume, 1)} L</td>
                          <td className="px-2 py-1.5 text-right">
                            <span className={`font-semibold ${Number(l.variance) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {Number(l.variance) >= 0 ? '+' : ''}{fmtNum(l.variance, 1)} L
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
          {filteredBatches.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">No batches match the current filters</p>}
        </div>
      </Card>
    </div>
  );
}
