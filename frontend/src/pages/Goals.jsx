import React, { useContext, useEffect, useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const Goals = () => {
  const { backendUrl } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState({});
  const [contributions, setContributions] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  const res = await axios.get(`${backendUrl}/api/product/get-user-products`, {
          headers: { Authorization: `Bearer ${token}` }, withCredentials: true
        });
        setProducts(res.data.products || []);
      } catch (err) {
        let msg = 'Failed to load goals';
        if (err.response && err.response.data) {
          msg += ': ' + (err.response.data.error || err.response.data.message || JSON.stringify(err.response.data));
        } else if (err.message) {
          msg += ': ' + err.message;
        }
        setError(msg);
        console.error('Goals API error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [backendUrl]);

  // Fetch contributions for all products
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const res = await axios.get(`${backendUrl}/api/userContribute/get-Contribute`, {
          headers: { Authorization: `Bearer ${token}` }, withCredentials: true
        });
        // Map productId to contributionAmount
        const contribMap = {};
        (res.data.contributions || []).forEach(c => {
          contribMap[c.productId] = c.contributionAmount;
        });
        setContributions(contribMap);
      } catch {
        // ignore
      }
    };
    fetchContributions();
  }, [backendUrl, products]);


  const handleToggleDetails = (id) => {
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Remove goal (delete product)
  const handleRemoveGoal = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this goal? This will also remove all contributions for this product.')) return;
    try {
      setLoading(true);
      setError('');
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      await axios.delete(`${backendUrl}/api/product/deleteProduct`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: [productId] },
        withCredentials: true
      });
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      let msg = 'Failed to remove goal';
      if (err.response && err.response.data) {
        msg += ': ' + (err.response.data.error || err.response.data.message || JSON.stringify(err.response.data));
      } else if (err.message) {
        msg += ': ' + err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DashboardNavbar />
      <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
        <h2 style={{ marginBottom: 24 }}>Your Goals</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : products.length === 0 ? (
          <div>No goals found. Add a product to start tracking your savings goal!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {products.map(product => {
              const contributed = contributions[product._id] || 0;
              const percent = Math.min(100, Math.round((contributed / product.productPrice) * 100));
              return (
                <div key={product._id} style={{ border: '1px solid #e0e0e0', borderRadius: 14, padding: '24px 28px', background: '#fafdff', marginBottom: 18, boxShadow: '0 2px 8px #f2f6fa', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 2 }}>{product.productName}</div>
                      <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>₹{product.productPrice}</div>
                      <div style={{ margin: '10px 0 6px', height: 14, background: '#e3eafc', borderRadius: 7, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? '#43a047' : '#1976d2', transition: 'width 0.5s' }} />
                        <span style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', fontSize: 13, color: percent === 100 ? '#43a047' : '#1976d2', fontWeight: 700 }}>{percent}%</span>
                      </div>
                      <div style={{ fontSize: 15, color: '#555', marginBottom: 2 }}>Saved: ₹{contributed} / ₹{product.productPrice}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => handleToggleDetails(product._id)}
                        style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: showDetails[product._id] ? '#e3eafc' : '#1976d2', color: showDetails[product._id] ? '#1976d2' : '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        {showDetails[product._id] ? 'Hide Details' : 'Show Details'}
                      </button>
                      <button
                        onClick={() => handleRemoveGoal(product._id)}
                        style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#ff5252', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }}
                        title="Remove Goal"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {showDetails[product._id] && (
                    <div style={{ marginTop: 20, background: '#f4f8ff', borderRadius: 10, padding: '18px 20px', fontSize: 16, color: '#222', boxShadow: '0 1px 4px #e3eafc' }}>
                      <div style={{ marginBottom: 6 }}><b>Product Name:</b> {product.productName}</div>
                      <div style={{ marginBottom: 6 }}><b>Price:</b> ₹{product.productPrice}</div>
                      <div style={{ marginBottom: 6 }}><b>Target Date:</b> {product.targetDate ? new Date(product.targetDate).toLocaleDateString() : 'N/A'}</div>
                      <div style={{ marginBottom: 6 }}><b>Link:</b> <a href={product.productLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', wordBreak: 'break-all' }}>{product.productLink}</a></div>
                      <div style={{ marginBottom: 6 }}><b>Type:</b> {product.productType}</div>
                      <div style={{ marginTop: 12, color: '#1976d2', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span role="img" aria-label="target">🎯</span> Keep going! You're making great progress toward your goal.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;

