'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface GraphData {
  nodes: { id: string }[];
  edges: { source_uid: string; target_uid: string; type: string }[];
}

interface StatsData {
  status: string;
  tenantId: string;
}

export default function Dashboard() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded for demo
  const API_URL = 'http://localhost:3000/api/v1';
  const TENANT_ID = 'test-tenant';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'x-tenant-id': TENANT_ID,
          // Add auth header if needed, assuming mock auth for now or none if dev mode allows
          'Authorization': 'Bearer mock-token' 
        };

        const [statsRes, graphRes] = await Promise.all([
          axios.get(`${API_URL}/memory/stats`, { headers }),
          axios.get(`${API_URL}/memory/graph`, { headers })
        ]);

        setStats(statsRes.data);
        setGraph(graphRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard data. Ensure API is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-24">Loading Dashboard...</div>;
  if (error) return <div className="p-24 text-red-500">{error}</div>;

  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-4xl font-bold mb-8">Memory Engine Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stats Card */}
        <div className="p-6 border rounded-lg shadow-sm bg-white text-black">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <p><span className="font-bold">Status:</span> {stats?.status}</p>
            <p><span className="font-bold">Tenant:</span> {stats?.tenantId}</p>
          </div>
        </div>

        {/* Graph Stats Card */}
        <div className="p-6 border rounded-lg shadow-sm bg-white text-black">
          <h2 className="text-2xl font-semibold mb-4">Knowledge Graph</h2>
          <div className="space-y-2">
            <p><span className="font-bold">Nodes:</span> {graph?.nodes.length}</p>
            <p><span className="font-bold">Edges:</span> {graph?.edges.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Graph List */}
      <div className="mt-8 p-6 border rounded-lg shadow-sm bg-white text-black">
        <h2 className="text-2xl font-semibold mb-4">Graph Connections</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b font-medium">
              <tr>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Target</th>
              </tr>
            </thead>
            <tbody>
              {graph?.edges.slice(0, 10).map((edge, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-2">{edge.source_uid}</td>
                  <td className="px-4 py-2 text-blue-600">{edge.type}</td>
                  <td className="px-4 py-2">{edge.target_uid}</td>
                </tr>
              ))}
              {graph?.edges.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-500">No connections found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
