import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { inventoryApi } from '../services/inventoryApi';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProducts = useCallback(async () => {
    if (currentUser?.activeOrgId) {
      setLoading(true);
      setError(null);
      try {
        const response = await inventoryApi.getProducts();
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading) {
      refreshProducts();
    }
  }, [currentUser, authLoading, refreshProducts]);

  const addProduct = async (productData) => {
    try {
      const response = await inventoryApi.addProduct(productData);
      await refreshProducts();
      return response.data;
    } catch (e) {
      throw e;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const response = await inventoryApi.updateProduct(productId, productData);
      await refreshProducts();
      return response.data;
    } catch (e) {
      throw e;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await inventoryApi.deleteProduct(productId);
      await refreshProducts();
    } catch (e) {
      throw e;
    }
  };

  const bulkDeleteProducts = async (productIds) => {
    try {
      await inventoryApi.bulkDeleteProducts(productIds);
      await refreshProducts();
    } catch (e) {
      throw e;
    }
  };

  const importProducts = async (productsData) => {
    try {
      const response = await inventoryApi.importProducts(productsData);
      await refreshProducts();
      return response.data;
    } catch (e) {
      throw e;
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      bulkDeleteProducts,
      importProducts,
      loading: loading || authLoading, 
      error, 
      refreshProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error("useProducts must be used within a ProductProvider");
    return context;
};
