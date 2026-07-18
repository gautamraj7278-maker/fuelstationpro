import { useEffect, useMemo, useState, useCallback } from 'react';
import { Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { LineChart } from '../components/Charts';
import { Badge } from '../components/ui/Badge';
import { Loading, ErrorState } from '../components/ui/States';
import { apiGet, fmtMoney, fmtNum, fmtDate } from '../lib/api';
import { toCSV, downloadCSV } from '../lib/csv';

export default function PriceHistoryReport() {
  const [history, setHistory] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [h, p] = await Promise.all([
        apiGet('/api/price-history'),
        apiGet('/api/products'),
      ]);
      setHistory(h || []);
      setProducts(p || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const byDate = String(a.effective_date || '').localeCompare(String(b.effective_date || ''));
      if (byDate !== 0) return byDate;
      return Number(a.id || 0) - Number(b.id || 0);
    });
  }, [history]);

  const filteredHistory = useMemo(() => {
    return sortedHistory.filter((row) => {
      if (productFilter !== 'all' && row.product_name !== productFilter) return false;
      if (dateFrom && String(row.effective_date || '') < dateFrom) return false;
      if (dateTo && String(row.effective_date || '') > dateTo) return false;
      return true;
    });
  }, [sortedHistory, productFilter, dateFrom, dateTo]);

  const lineChartDataByProduct = useMemo(() => {
    const map = new Map<string, { label: string; value: number }[]>();
    sortedHistory.forEach((row) => {
      const p = String(row.product_name || '');
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push({ label: String(row.effective_date || '').slice(0, 7), value: Number(row.new_price || 0) });
    });
    return map;
  }, [sortedHistory]);

  const currentPriceByProduct = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const map = new Map<string, number>();
    sortedHistory
      .filter((row) => String(row.effective_date || '') <= today)
      .forEach((row) => { map.set(String(row.product_name || ''), Number(row.new_price || 0)); });
    return map;
  }, [sortedHistory]);

  const exportReport = () => downloadCSV('price_history_report.csv', toCSV(
    filteredHistory.map((row) => ({
      product: row.product_name,
      old_price: Number(row.old_price || 0).toFixed(2),
      new_price: Number(row.new_price || 0).toFixed(2),
      effective_date: row.effective_date,
      inflation_pct: Number(row.old_price || 0) > 0
        ? (((Number(row.new_price || 0) - Number(row.old_price || 0)) / Number(row.old_price || 0)) * 100).toFixed(2)
        : 'N/A',
      changed_by: row.changed_by || '',
      remarks: row.remarks || '',
    }))
  ));

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Price History Report</h1>
          <p className="text-sm text-slate-400 mt-0.5">Price revision tracking, inflation analysis, and effective price timeline</p>
        </div>
        <button onClick={exportReport} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"><Download className="w-4 h-4" /> Export Report</button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600"><Filter className="w-4 h-4" /> Filters</span>
          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white">
            <option value="all">All Products</option>
            {products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white" title="Effective Date From" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white" title="Effective Date To" />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5"><div className="text-xs text-slate-400">Products Priced</div><div className="text-2xl font-bold text-slate-800 mt-1">{currentPriceByProduct.size}</div></Card>
        <Card className="p-5"><div className="text-xs text-slate-400">Price Revisions</div><div className="text-2xl font-bold text-slate-800 mt-1">{history.length}</div></Card>
        <Card className="p-5">
          <div className="text-xs text-slate-400">Filtered Revisions</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{filteredHistory.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-slate-400">Avg Price Changes / Product</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{currentPriceByProduct.size > 0 ? fmtNum(history.length / currentPriceByProduct.size, 1) : '0'}</div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Current Effective Prices" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3 text-right">Current Price</th>
                <th className="px-5 py-3 text-right">Total Revisions</th>
                <th className="px-5 py-3 text-right">First Price</th>
                <th className="px-5 py-3 text-right">Net Change</th>
                <th className="px-5 py-3 text-right">Overall Inflation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product: any) => {
                const productHistory = sortedHistory.filter((row) => row.product_name === product.name);
                const firstPrice = productHistory.length > 0 ? Number(productHistory[0].new_price || 0) : 0;
                const currentPrice = currentPriceByProduct.get(product.name) ?? 0;
                const netChange = Number(currentPrice) - firstPrice;
                const overallInflation = firstPrice > 0 ? ((Number(currentPrice) - firstPrice) / firstPrice) * 100 : null;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-slate-700">{product.name}</td>
                    <td className="px-5 py-3 text-right text-slate-800 font-semibold">{fmtMoney(currentPrice)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{productHistory.length}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{productHistory.length > 0 ? fmtMoney(firstPrice) : '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-semibold ${netChange > 0 ? 'text-emerald-600' : netChange < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                        {netChange > 0 ? '+' : ''}{fmtMoney(netChange)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {overallInflation == null ? '—' : (
                        <span className={`font-semibold ${overallInflation > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {overallInflation >= 0 ? '+' : ''}{fmtNum(overallInflation, 2)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No products configured</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {productFilter !== 'all' && lineChartDataByProduct.has(productFilter) && (
        <Card>
          <CardHeader title={`Price Trend: ${productFilter}`} />
          <div className="p-5">
            <LineChart data={lineChartDataByProduct.get(productFilter) || []} valueFmt={(n) => fmtMoney(n)} />
          </div>
        </Card>
      )}

      {productFilter === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from(lineChartDataByProduct.entries()).slice(0, 4).map(([productName, data]) => (
            <Card key={productName}>
              <CardHeader title={`Price Trend: ${productName}`} />
              <div className="p-5">
                <LineChart data={data} valueFmt={(n) => fmtMoney(n)} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader title="Price Change Log" subtitle="Detailed revision history with inflation tracking" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3 text-right">Old Price</th>
                <th className="px-5 py-3 text-right">New Price</th>
                <th className="px-5 py-3 text-right">Inflation</th>
                <th className="px-5 py-3">Effective Date</th>
                <th className="px-5 py-3">Remarks</th>
                <th className="px-5 py-3">Changed By</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.map((row, idx) => {
                const oldPrice = Number(row.old_price || 0);
                const newPrice = Number(row.new_price || 0);
                const inflation = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : null;
                const isFuture = String(row.effective_date || '') > new Date().toISOString().slice(0, 10);
                const today = new Date().toISOString().slice(0, 10);
                const isCurrent = !isFuture && (
                  idx === filteredHistory.length - 1 ||
                  (idx < filteredHistory.length - 1 && String(filteredHistory[idx + 1].effective_date || '') !== String(row.effective_date || ''))
                );
                return (
                  <tr key={row.id || idx} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-slate-700">{row.product_name}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{fmtMoney(oldPrice)}</td>
                    <td className="px-5 py-3 text-right text-slate-800 font-semibold">{fmtMoney(newPrice)}</td>
                    <td className="px-5 py-3 text-right">
                      {inflation == null ? <span className="text-slate-400">—</span> : (
                        <span className={`inline-flex items-center gap-1 font-medium ${inflation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {inflation >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {inflation >= 0 ? '+' : ''}{fmtNum(inflation, 2)}%
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{fmtDate(row.effective_date)}</td>
                    <td className="px-5 py-3 text-slate-600 max-w-[200px] truncate" title={row.remarks || ''}>{row.remarks || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{row.changed_by || '—'}</td>
                    <td className="px-5 py-3">
                      {isFuture ? <Badge color="amber">Scheduled</Badge> : isCurrent ? <Badge color="green">Current</Badge> : <Badge color="slate">History</Badge>}
                    </td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">No price changes recorded yet</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
