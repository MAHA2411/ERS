// src/components/StatsCard.jsx
import React from "react";

const StatsCard = ({ title, value }) => (
  <div className="bg-white shadow rounded p-6 flex flex-col items-center">
    <h3 className="text-gray-500">{title}</h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

export default StatsCard;
