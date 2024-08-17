import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryDistributionChart from './components/charts/CategoryDistributionChart';
import InventoryTrendChart from './components/charts/InventoryTrendChart';
import QuantityByCategoryChart from './components/charts/QuantityByCategoryChart';
import BeverageHistoryChart from './components/charts/BeverageHistoryChart';

const BeveragesGraphPage = () => {
  const [beverages, setBeverages] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [inventoryTrends, setInventoryTrends] = useState([]);
  const [quantityByCategory, setQuantityByCategory] = useState([]);

  useEffect(() => {
    const fetchBeverages = async () => {
      try {
        const response = await axios.get('https://sarara-be.vercel.app/api/beverages');
        setBeverages(response.data);

        const categories = response.data.reduce((acc, beverage) => {
          acc[beverage.category] = (acc[beverage.category] || 0) + 1;
          return acc;
        }, {});
        setCategoryDistribution(Object.entries(categories));

        const trends = response.data.map(beverage => ({
          name: beverage.name,
          history: beverage.history,
        }));
        setInventoryTrends(trends);

        const quantityPerCategory = response.data.reduce((acc, beverage) => {
          acc[beverage.category] = (acc[beverage.category] || 0) + beverage.quantity;
          return acc;
        }, {});
        setQuantityByCategory(Object.entries(quantityPerCategory));
      } catch (error) {
        console.error('Error fetching beverages:', error);
      }
    };

    fetchBeverages();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Beverages Dashboard</h1>
      <div className="mb-4">
        <CategoryDistributionChart data={categoryDistribution} />
      </div>
      <div className="mb-4">
        <InventoryTrendChart data={inventoryTrends} />
      </div>
      <div>
        <QuantityByCategoryChart data={quantityByCategory} />
      </div>
      <div>
        <BeverageHistoryChart data={quantityByCategory} />
      </div>
    </div>
  );
};

export default BeveragesGraphPage;

