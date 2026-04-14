import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { inventoryApi } from '../services/inventoryApi';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState(null);

  const fetchProductsFn = async () => {
    if (!currentUser?.activeOrgId) return [];
    const response = await inventoryApi.getProducts();
    return response.data;
  };

  const { 
    data: products = [], 
    isLoading: queryLoading, 
    error: queryError,
    refetch: refreshProducts 
  } = useQuery({
    queryKey: ['products', currentUser?.activeOrgId],
    queryFn: fetchProductsFn,
    enabled: !!currentUser?.activeOrgId && !authLoading,
  });

  const addProduct = async (productData) => {
    setMutationError(null);
    try {
      const response = await inventoryApi.addProduct(productData);
      queryClient.invalidateQueries(['products', currentUser?.activeOrgId]);
      return response.data;
    } catch (e) {
      setMutationError(e.response?.data?.error || e.message);
      throw e;
    }
  };

  const updateProduct = async (productId, productData) => {
    setMutationError(null);
    try {
      const response = await inventoryApi.updateProduct(productId, productData);
      queryClient.invalidateQueries(['products', currentUser?.activeOrgId]);
      return response.data;
    } catch (e) {
      setMutationError(e.response?.data?.error || e.message);
      throw e;
    }
  };

  const deleteProduct = async (productId) => {
    setMutationError(null);
    try {
      await inventoryApi.deleteProduct(productId);
      queryClient.invalidateQueries(['products', currentUser?.activeOrgId]);
    } catch (e) {
      setMutationError(e.response?.data?.error || e.message);
      throw e;
    }
  };

  const bulkDeleteProducts = async (productIds) => {
    setMutationError(null);
    try {
      await inventoryApi.bulkDeleteProducts(productIds);
      queryClient.invalidateQueries(['products', currentUser?.activeOrgId]);
    } catch (e) {
      setMutationError(e.response?.data?.error || e.message);
      throw e;
    }
  };

  const importProducts = async (productsData) => {
    setMutationError(null);
    try {
      const response = await inventoryApi.importProducts(productsData);
      queryClient.invalidateQueries(['products', currentUser?.activeOrgId]);
      return response.data;
    } catch (e) {
      setMutationError(e.response?.data?.error || e.message);
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
      loading: queryLoading || authLoading, 
      error: mutationError || queryError?.message, 
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
