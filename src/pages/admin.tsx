import React from 'react';
import { Layout } from '../components/Layout';
import { AdminRoute } from '../components/AdminRoute';
import { AdminPanel } from '../components/AdminPanel';

export const AdminPage: React.FC = () => {
  return (
    <Layout title="Admin Panel - Super Mall">
      <AdminRoute>
        <AdminPanel />
      </AdminRoute>
    </Layout>
  );
};
