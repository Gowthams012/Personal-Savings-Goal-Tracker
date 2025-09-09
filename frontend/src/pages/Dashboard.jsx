
import React, { useContext, useState, useEffect } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const Dashboard = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const [mode, setMode] = useState('product'); // 'product' or 'contribution'
  // Add Product states
  const [productLink, setProductLink] = useState('');
  const [targetDate, setTargetDate] = useState('');
  // Add Contribution states
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [contributionAmt, setContributionAmt] = useState('');
  // Common
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch user's products for contribution dropdown
  // Fetch user's products for contribution dropdown
  useEffect(() => {
    if (mode === 'contribution') {
      const fetchProducts = async () => {
        setLoading(true);
        setMessage('');
        try {
          const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
          const res = await axios.get(`${backendUrl}/api/product/get-user-products`, {
            headers: { Authorization: `Bearer ${token}` }, withCredentials: true
          });
          setProducts(res.data.products || []);
        } catch (err) {
          setMessage('Failed to load products for contribution');
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [mode, backendUrl]);

  // Add Product handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await axios.post(
        `${backendUrl}/api/product/create-product`,
        {
          link: productLink,
          targetDate
        },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setMessage('Product added successfully!');
      setProductLink('');
      setTargetDate('');
      // Refresh products for contribution dropdown if user switches mode
      if (mode === 'contribution') {
        const res = await axios.get(`${backendUrl}/api/product/get-user-products`, {
          headers: { Authorization: `Bearer ${token}` }, withCredentials: true
        });
        setProducts(res.data.products || []);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  // Add Contribution handler
  const handleAddContribution = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!selectedProduct) {
      setMessage('Please select a goal');
      setLoading(false);
      return;
    }
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await axios.post(
        `${backendUrl}/api/contributions/add-contribute/${selectedProduct}`,
        { contributionAmount: contributionAmt },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setMessage('Contribution added successfully!');
      setSelectedProduct('');
      setContributionAmt('');
      // Notify Goals page to refresh
      window.dispatchEvent(new Event('contributionAdded'));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DashboardNavbar />
      <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
        <h2 style={{ marginBottom: 16 }}>
          Welcome{userData?.name ? `, ${userData.name}` : ''}!
        </h2>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => { setMode('product'); setMessage(''); }}
            style={{ flex: 1, padding: 10, borderRadius: 6, border: mode === 'product' ? '2px solid #1976d2' : '1px solid #ccc', background: mode === 'product' ? '#e3f0ff' : '#f9f9f9', fontWeight: 600 }}
          >
            Add Product
          </button>
          <button
            onClick={() => { setMode('contribution'); setMessage(''); }}
            style={{ flex: 1, padding: 10, borderRadius: 6, border: mode === 'contribution' ? '2px solid #1976d2' : '1px solid #ccc', background: mode === 'contribution' ? '#e3f0ff' : '#f9f9f9', fontWeight: 600 }}
          >
            Add Contribution
          </button>
        </div>

        {/* Add Product Form */}
        {mode === 'product' && (
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label htmlFor="product-link">Paste Product Link</label>
            <input
              id="product-link"
              type="url"
              placeholder="https://example.com/product"
              value={productLink}
              onChange={e => setProductLink(e.target.value)}
              required
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <label htmlFor="target-date">Target Date</label>
            <input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              required
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ padding: 10, borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600 }}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        )}

        {/* Add Contribution Form */}
        {mode === 'contribution' && (
          <form onSubmit={handleAddContribution} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label htmlFor="goal-select">Select Goal</label>
            <select
              id="goal-select"
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              required
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            >
              <option value="">-- Select a goal --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.productName} (₹{p.productPrice})</option>
              ))}
            </select>
            <label htmlFor="contribution-amt">Amount</label>
            <input
              id="contribution-amt"
              type="number"
              min="1"
              placeholder="Enter amount"
              value={contributionAmt}
              onChange={e => setContributionAmt(e.target.value)}
              required
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ padding: 10, borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600 }}
            >
              {loading ? 'Adding...' : 'Add Contribution'}
            </button>
          </form>
        )}

        {message && <div style={{ marginTop: 16, color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
      </div>
    </div>
  );
};

export default Dashboard;
