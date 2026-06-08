import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
        <p className="mt-2 text-sm text-gray-600">Skeleton Page Shell for Customer ID: <span className="font-semibold">{id}</span></p>
      </div>
    </div>
  );
};

export default CustomerDetail;
