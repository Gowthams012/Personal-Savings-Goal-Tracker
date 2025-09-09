import React, { useEffect, useState, useContext } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { AppContext } from '../context/AppContext';
import SavingsLineChart from '../components/SavingsLineChart';
import axios from 'axios';

const ContributionHistory = () => {
  const { backendUrl } = useContext(AppContext);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      setError('');
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  const res = await axios.get(`${backendUrl}/api/contributions/get-Contribute`, {
          headers: { Authorization: `Bearer ${token}` }, withCredentials: true
        });
        setContributions(res.data.contributions || []);
      } catch (err) {
        setError('Failed to load contribution history');
      } finally {
        setLoading(false);
      }
    };
    fetchContributions();
  }, [backendUrl]);


  // Prepare data for line chart: flatten all contributionHistory entries
  const allHistory = [];
  contributions.forEach(c => {
    (c.contributionHistory || []).forEach(entry => {
      allHistory.push({
        date: entry.date || c.contributionDate,
        amount: entry.amount || 0,
      });
    });
  });

  // Calculate total savings
  const totalSavings = allHistory.reduce((sum, h) => sum + (h.amount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#fafdff' }}>
      <DashboardNavbar />
      <div style={{ width: '100vw', minHeight: '100vh', background: '#fafdff', paddingTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0', display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', height: '50vh', minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #e3eafc', padding: '32px 0 24px 0' }}>
            <SavingsLineChart history={allHistory} />
          </div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #e3eafc', padding: 32 }}>
            <h2 style={{ marginBottom: 24, color: '#1976d2', fontWeight: 700 }}>Contribution History</h2>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div style={{ color: 'red' }}>{error}</div>
            ) : contributions.length === 0 ? (
              <div>No contributions found.</div>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
                  <thead>
                    <tr style={{ background: '#f4f8ff' }}>
                      <th style={{ padding: '10px 8px', textAlign: 'left', borderRadius: 6 }}>Product Name</th>
                      <th style={{ padding: '10px 8px', textAlign: 'left' }}>Amount</th>
                      <th style={{ padding: '10px 8px', textAlign: 'left' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((c) => (
                      c.contributionHistory.map((entry, idx) => (
                        <tr key={c._id + '-' + idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={{ padding: '8px 6px' }}>{c.productName || c.productId?.productName || 'N/A'}</td>
                          <td style={{ padding: '8px 6px', color: '#1976d2', fontWeight: 600 }}>₹{entry.amount}</td>
                          <td style={{ padding: '8px 6px', color: '#555' }}>{entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 28, background: '#e3f0ff', borderRadius: 10, boxShadow: '0 1px 4px #e3eafc', padding: '14px 38px', fontSize: 24, color: '#1976d2', fontWeight: 700, zIndex: 2, textAlign: 'center', letterSpacing: 0.5 }}>
                  Total Savings: ₹{totalSavings}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionHistory;
