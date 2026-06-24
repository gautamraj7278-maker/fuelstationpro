import { useEffect, useMemo, useState, useCallback } from 'react';
import { Download, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { LineChart, BarChart, DonutChart } from '../components/Charts';
import { Badge } from '../components/ui/Badge';
import { Loading, ErrorState } from '../components/ui/States';
import { apiGet, fmtMoney, fmtNum, fmtDate } from '../lib/api';
import { toCSV, downloadCSV } from '../lib/csv';

type Period = 'daily' | 'monthly' | 'quarterly' | 'yearly';

export default function DailySalesReport() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<Period>('monthly');
  const [productFilter, setProductFilter] = useState('all');
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [dispenserFilter, setDispenserFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ pageSize: '5000' });
      if (dateFrom) params.set('sale_date_from', dateFrom);
      if (dateTo) params.set('sale_date_to', dateTo);
      const res = await apiGet(`/api/daily-sales?${params.toString()}`);
      setEntries(res.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const products = useMemo(() => {
    const set = new Set<string>();
    (entries || []).forEach((e) => {
      (e.daily_sales_nozzle_readings || []).forEach((r: any) => { if (r.product_name) set.add(r.product_name); });
    });
    return Array.from(set).sort();
  }, [entries]);

  const operators = useMemo(() => Array.from(new Set((entries || []).map((e) => e.operator_name).filter(Boolean))).sort(), [entries]);
  const dispensers = useMemo(() => Array.from(new Set((entries || []).map((e) => e.dispenser_name).filter(Boolean))).sort(), [entries]);
  const shifts = useMemo(() => Array.from(new Set((entries || []).map((e) => e.shift_name).filter(Boolean))).sort(), [entries]);

  const filteredEntries = useMemo(() => {
    return (entries || []).filter((e) => {
      if (operatorFilter !== 'all' && e.operator_name !== operatorFilter) return false;
      if (dispenserFilter !== 'all' && e.dispenser_name !== dispenserFilter) return false;
      if (shiftFilter !== 'all' && e.shift_name !== shiftFilter) return false;
      if (productFilter !== 'all') {
        const hasProduct = (e.daily_sales_nozzle_readings || []).some((r: any) => r.product_name === productFilter);
        if (!hasProduct) return false;
      }
      return true;
    });
  }, [entries, operatorFilter, dispenserFilter, shiftFilter, productFilter]);

  const bucketKey = (d: string) => {
    const date = new Date(d);
    if (period === 'daily') return d.slice(0, 10);
    if (period === 'monthly') return d.slice(0, 7);
    if (period === 'quarterly') return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
    return String(date.getFullYear());
  };

  const grouped = useMemo(() => {
    const m: Record<string, { amount: number; volume: number; count: number; cash: number; online: number; credit: number; variance: number }> = {};
    filteredEntries.forEach((e) => {
      const k = bucketKey(e.sale_date || '');
      m[k] = m[k] || { amount: 0, volume: 0, count: 0, cash: 0, online: 0, credit: 0, variance: 0 };
      m[k].amount += Number(e.total_sales_amount || 0);
      m[k].variance += Number(e.variance || 0);
      m[k].cash += Number(e.cash_amount || 0);
      m[k].online += Number(e.online_amount || 0);
      m[k].credit += Number(e.credit_amount || 0);
      m[k].count++;
      (e.daily_sales_nozzle_readings || []).forEach((r: any) => {
        const testByNozzle = (e.daily_sales_testing || []).find((t: any) => t.nozzle_name === r.nozzle_name);
        const testVol = Number(testByNozzle?.volume || 0);
        m[k].volume += Math.max(0, Number(r.volume || 0) - testVol);
      });
    });
    return Object.entries(m).sort().map(([period, v]) => ({ period, ...v }));
  }, [filteredEntries, period]);

  const revenueSeries = grouped.slice(-12).map((g) => ({ label: g.period.slice(-7), value: Math.round(g.amount) }));
  const volumeBars = grouped.slice(-12).map((g) => ({ label: g.period.slice(-7), value: Math.round(g.volume) }));
  const kpiTotalRev = grouped.reduce((s, g) => s + g.amount, 0);
  const kpiTotalVol = grouped.reduce((s, g) => s + g.volume, 0);
  const kpiTotalVar = grouped.reduce((s, g) => s + g.variance, 0);
  const kpiTotalEntries = grouped.reduce((s, g) => s + g.count, 0);

  const paymentMix = useMemo(() => {
    const totalCash = grouped.reduce((s, g) => s + g.cash, 0);
    const totalOnline = grouped.reduce((s, g) => s + g.online, 0);
    const totalCredit = grouped.reduce((s, g) => s + g.credit, 0);
    const total = totalCash + totalOnline + totalCredit || 1;
    return [
      { label: 'Cash', value: Math.round((totalCash / total) * 100), color: '#16a34a' },
      { label: 'Online', value: Math.round((totalOnline / total) * 100), color: '#2563eb' },
      { label: 'Credit', value: Math.round((totalCredit / total) * 100), color: '#e11d48' },
    ];
  }, [grouped]);

  const exportReport = () => downloadCSV(`daily_sales_${period}.csv`, toCSV(
    grouped.map((g) => ({
      period: g.period,
      revenue: g.amount.toFixed(2),
      volume_liters: g.volume.toFixed(2),
      cash: g.cash.toFixed(2),
      online: g.online.toFixed(2),
      credit: g.credit.toFixed(2),
      variance: g.variance.toFixed(2),
      entries: g.count,
    }))
  ));

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Daily Sales Report</h1>
          <p className="text-sm text-slate-400 mt-0.5">Detailed sales analytics with period, product, operator, dispenser drill-down</p>
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
          <select value={operatorFilter} onChange={(e) => setOperatorFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="all">All Operators</option>
            {operators.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={dispenserFilter} onChange={(e) => setDispenserFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="all">All Dispensers</option>
            {dispensers.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="all">All Shifts</option>
            {shifts.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5"><div className="text-xs text-slate-400">Total Revenue</div><div className="text-2xl font-bold text-slate-800 mt-1">{fmtMoney(kpiTotalRev)}</div></Card>
        <Card className="p-5"><div className="text-xs text-slate-400">Total Volume</div><div className="text-2xl font-bold text-slate-800 mt-1">{fmtNum(kpiTotalVol, 0)} L</div></Card>
        <Card className="p-5"><div className="text-xs text-slate-400">Sales Variance</div><div className={`text-2xl font-bold mt-1 ${kpiTotalVar >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{kpiTotalVar >= 0 ? '+' : ''}{fmtMoney(kpiTotalVar)}</div></Card>
        <Card className="p-5"><div className="text-xs text-slate-400">Total Entries</div><div className="text-2xl font-bold text-slate-800 mt-1">{kpiTotalEntries}</div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader title="Revenue Trend" subtitle={`By ${period}`} /><div className="p-5">{revenueSeries.length ? <LineChart data={revenueSeries} valueFmt={(n) => fmtMoney(n)} /> : <p className="text-sm text-slate-400 py-8 text-center">No data</p>}</div></Card>
        <Card><CardHeader title="Volume Dispensed" subtitle={`By ${period}`} /><div className="p-5">{volumeBars.length ? <BarChart data={volumeBars} color="#16a34a" valueFmt={(n) => fmtNum(n, 0) + ' L'} /> : <p className="text-sm text-slate-400 py-8 text-center">No data</p>}</div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><CardHeader title="Payment Mix" /><div className="p-5"><DonutChart data={paymentMix} /></div></Card>
        <Card className="lg:col-span-2 p-5">
          <CardHeader title="Payment Method Breakdown" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-500">Cash</div>
              <div className="text-xl font-bold text-emerald-700 mt-1">{fmtMoney(grouped.reduce((s, g) => s + g.cash, 0))}</div>
              <div className="text-xs text-slate-400 mt-1">{fmtNum(grouped.reduce((s, g) => s + g.cash, 0) / (kpiTotalRev || 1) * 100, 1)}%</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-500">Online</div>
              <div className="text-xl font-bold text-blue-700 mt-1">{fmtMoney(grouped.reduce((s, g) => s + g.online, 0))}</div>
              <div className="text-xs text-slate-400 mt-1">{fmtNum(grouped.reduce((s, g) => s + g.online, 0) / (kpiTotalRev || 1) * 100, 1)}%</div>
            </div>
            <div className="bg-rose-50 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-500">Credit</div>
              <div className="text-xl font-bold text-rose-700 mt-1">{fmtMoney(grouped.reduce((s, g) => s + g.credit, 0))}</div>
              <div className="text-xs text-slate-400 mt-1">{fmtNum(grouped.reduce((s, g) => s + g.credit, 0) / (kpiTotalRev || 1) * 100, 1)}%</div>
            </div>
          </div>
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
                <th className="px-5 py-3 text-right">Revenue</th>
                <th className="px-5 py-3 text-right">Volume (L)</th>
                <th className="px-5 py-3 text-right">Cash</th>
                <th className="px-5 py-3 text-right">Online</th>
                <th className="px-5 py-3 text-right">Credit</th>
                <th className="px-5 py-3 text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {grouped.slice().reverse().map((g) => (
                <tr key={g.period} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-700">{g.period}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{g.count}</td>
                  <td className="px-5 py-3 text-right text-slate-700 font-semibold">{fmtMoney(g.amount)}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{fmtNum(g.volume, 0)}</td>
                  <td className="px-5 py-3 text-right text-emerald-600">{fmtMoney(g.cash)}</td>
                  <td className="px-5 py-3 text-right text-blue-600">{fmtMoney(g.online)}</td>
                  <td className="px-5 py-3 text-right text-rose-600">{fmtMoney(g.credit)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-semibold ${g.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {g.variance >= 0 ? '+' : ''}{fmtMoney(g.variance)}
                    </span>
                  </td>
                </tr>
              ))}
              {grouped.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">No sales data</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Sales Entries" subtitle="Click to drill through into nozzle readings" />
        <div className="space-y-2 px-5 pb-5">
          {filteredEntries.slice(0, 100).map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="rounded-lg border border-slate-200">
                <button onClick={() => setExpandedId(isExpanded ? null : entry.id)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <span className="font-medium text-slate-800">{fmtDate(entry.sale_date)}</span>
                      <span className="text-slate-400 mx-2">•</span>
                      <span className="text-sm text-slate-500">{entry.shift_name}</span>
                      <span className="text-slate-400 mx-2">•</span>
                      <span className="text-sm text-slate-500">{entry.operator_name}</span>
                      <span className="text-slate-400 mx-2">•</span>
                      <span className="text-sm text-slate-500">{entry.dispenser_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-emerald-600">{fmtMoney(entry.total_sales_amount)}</span>
                    <span className={`text-xs ${Number(entry.variance || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      Var: {Number(entry.variance || 0) >= 0 ? '+' : ''}{fmtMoney(entry.variance)}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                      <div className="bg-emerald-50 rounded-lg p-2 text-center"><span className="text-xs text-slate-500">Cash</span><div className="font-bold text-emerald-700">{fmtMoney(entry.cash_amount)}</div></div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center"><span className="text-xs text-slate-500">Online</span><div className="font-bold text-blue-700">{fmtMoney(entry.online_amount)}</div></div>
                      <div className="bg-rose-50 rounded-lg p-2 text-center"><span className="text-xs text-slate-500">Credit</span><div className="font-bold text-rose-700">{fmtMoney(entry.credit_amount)}</div></div>
                    </div>
                    <table className="w-full text-sm mt-3">
                      <thead>
                        <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                          <th className="px-2 py-1">Nozzle</th>
                          <th className="px-2 py-1">Product</th>
                          <th className="px-2 py-1 text-right">Opening</th>
                          <th className="px-2 py-1 text-right">Closing</th>
                          <th className="px-2 py-1 text-right">Dispensed</th>
                          <th className="px-2 py-1 text-right">Testing</th>
                          <th className="px-2 py-1 text-right">Net</th>
                          <th className="px-2 py-1 text-right">Rate</th>
                          <th className="px-2 py-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(entry.daily_sales_nozzle_readings || []).map((r: any) => {
                          const testRow = (entry.daily_sales_testing || []).find((t: any) => t.nozzle_name === r.nozzle_name);
                          const testVol = Number(testRow?.volume || 0);
                          const netVol = Math.max(0, Number(r.volume || 0) - testVol);
                          const netAmt = Number(r.amount || 0) - Number(testRow?.amount || 0);
                          return (
                            <tr key={r.id}>
                              <td className="px-2 py-1 text-slate-700">{r.nozzle_name}</td>
                              <td className="px-2 py-1"><Badge color="blue">{r.product_name}</Badge></td>
                              <td className="px-2 py-1 text-right text-slate-600">{fmtNum(r.opening_reading, 2)}</td>
                              <td className="px-2 py-1 text-right text-slate-600">{fmtNum(r.closing_reading, 2)}</td>
                              <td className="px-2 py-1 text-right font-semibold text-slate-700">{fmtNum(r.volume, 2)} L</td>
                              <td className="px-2 py-1 text-right text-amber-600">{fmtNum(testVol, 2)} L</td>
                              <td className="px-2 py-1 text-right font-semibold text-slate-700">{fmtNum(netVol, 2)} L</td>
                              <td className="px-2 py-1 text-right text-slate-600">{fmtMoney(r.unit_price)}</td>
                              <td className="px-2 py-1 text-right font-semibold text-emerald-700">{fmtMoney(netAmt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {filteredEntries.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">No sales entries match the current filters</p>}
        </div>
      </Card>
    </div>
  );
}
