import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/analytics-data");
        setAnalytics(response.data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page loading">
        <div className="spinner-border" role="status" style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--accent-terracotta)', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', color: '#fff', fontFamily: 'Poppins' }}>Loading Analytics...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page error">
        <h2>{error}</h2>
      </div>
    );
  }

  // Format data for charts
  const styleData = Object.entries(analytics.style_distribution).map(([name, count]) => ({
    name,
    count
  }));

  const authData = Object.entries(analytics.authenticity_ratio).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
    value
  }));

  const COLORS = ['#c9973f', '#b8632a']; // Gold for genuine (index 0 usually), terracotta for replica (index 1)

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>System Analytics & Performance</h1>
      </div>

      <div className="kpi-cards">
        <div className="kpi-card">
          <h3>Total Artworks Analyzed</h3>
          <div className="kpi-value">{analytics.total_scans}</div>
        </div>
        <div className="kpi-card">
          <h3>Average System Accuracy</h3>
          <div className="kpi-value">{(analytics.average_accuracy * 100).toFixed(1)}%</div>
        </div>
        <div className="kpi-card">
          <h3>System Status</h3>
          <div className="kpi-value status-online">ONLINE - ALL MODELS ACTIVE</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Style Prediction Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={styleData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#d0d0d0" tick={{ fill: '#d0d0d0' }} />
                <YAxis stroke="#d0d0d0" tick={{ fill: '#d0d0d0' }} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1d21', border: '1px solid #b8632a', color: '#fff' }} 
                  itemStyle={{ color: '#c9973f' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="count" fill="#c9973f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h3>Authenticity Ratio</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={authData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fill: '#fff', fontSize: '14px', fontFamily: 'Nunito' }}
                >
                  {authData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1d21', border: '1px solid #b8632a', color: '#fff' }} 
                />
                <Legend wrapperStyle={{ color: '#d0d0d0', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
