import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { inventoryApi } from '../services/inventoryApi';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshOrders = useCallback(async () => {
    if (currentUser?.activeOrgId) {
      setLoading(true);
      setError(null);
      try {
        const [salesRes, purchasesRes] = await Promise.all([
          inventoryApi.getSaleOrders(),
          inventoryApi.getPurchaseOrders()
        ]);
        setSales(salesRes.data);
        setPurchases(purchasesRes.data);
      } catch (err) {
        console.error('Core: Order fetch failure:', err);
        setError(err.response?.data?.error || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading) {
      refreshOrders();
    }
  }, [currentUser, authLoading, refreshOrders]);

  const addSaleOrder = async (orderData) => {
    try {
      const res = await inventoryApi.addSaleOrder(orderData);
      await refreshOrders();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Sale order creation failed.");
    }
  };

  const addPurchaseOrder = async (orderData) => {
    try {
      const res = await inventoryApi.addPurchaseOrder(orderData);
      await refreshOrders();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Purchase order creation failed.");
    }
  };

  const updateSaleOrder = async (id, data) => {
    try {
      await inventoryApi.updateSaleOrder(id, data);
      await refreshOrders();
    } catch(err) {
      throw new Error("Update failed.");
    }
  };

  const deleteSaleOrders = async (ids) => {
    try {
      await inventoryApi.bulkDeleteSaleOrders(ids);
      await refreshOrders();
    } catch(err) {
      throw new Error("Delete failed.");
    }
  };

  const updatePurchaseOrder = async (id, data) => {
    try {
      await inventoryApi.updatePurchaseOrder(id, data);
      await refreshOrders();
    } catch(err) {
      throw new Error("Update failed.");
    }
  };

  const deletePurchaseOrders = async (ids) => {
    try {
      await inventoryApi.bulkDeletePurchaseOrders(ids);
      await refreshOrders();
    } catch(err) {
      throw new Error("Delete failed.");
    }
  };


  return (
    <OrderContext.Provider value={{ 
      sales, 
      purchases, 
      addSaleOrder, 
      addPurchaseOrder,
      updateSaleOrder,
      deleteSaleOrders,
      updatePurchaseOrder,
      deletePurchaseOrders,
      loading: loading || authLoading, 
      error, 
      refreshOrders 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
