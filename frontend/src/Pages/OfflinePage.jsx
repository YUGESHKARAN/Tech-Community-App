import React from "react";

const OfflinePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">🔌 No Internet Connection</h1>
      <p className="text-gray-600 mb-6">
        It looks like you’re offline. Please check your network connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Retry
      </button>
    </div>
  );
};

export default OfflinePage;
