import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowUpDown, TrendingUp, BarChartHorizontalBig } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

const BestSellingProductsTable = ({ data, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'totalRevenueGenerated', direction: 'descending' });

  const sortedData = useMemo(() => {
    let sortableItems = [...(data || [])];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return (
      <Card className="glass-panel border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary"/>Best-Selling Products</CardTitle>
          <CardDescription>Top products by revenue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-none shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-extrabold">
          <TrendingUp className="h-6 w-6 text-primary"/> Best-Sellers
        </CardTitle>
        <CardDescription>Top performing product lines by generated revenue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead onClick={() => requestSort('productName')} className="cursor-pointer hover:text-primary transition-colors">
                Product <ArrowUpDown className="ml-2 h-3 w-3 inline" />
              </TableHead>
              <TableHead onClick={() => requestSort('totalQuantitySold')} className="cursor-pointer hover:text-primary transition-colors text-center">
                Units <ArrowUpDown className="ml-2 h-3 w-3 inline" />
              </TableHead>
              <TableHead onClick={() => requestSort('totalRevenueGenerated')} className="cursor-pointer hover:text-primary transition-colors text-right">
                Revenue <ArrowUpDown className="ml-2 h-3 w-3 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.slice(0, 5).map((product) => (
                <TableRow key={product.productId} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="font-bold">{product.productName}</TableCell>
                  <TableCell className="text-center font-medium">{product.totalQuantitySold}</TableCell>
                  <TableCell className="text-right font-extrabold text-emerald-500">
                    ${product.totalRevenueGenerated.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">
                  No sales data recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BestSellingProductsTable;
