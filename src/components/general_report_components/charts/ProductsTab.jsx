import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ProductsTab = ({ chartData }) => {
  const { productUsageData } = chartData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>BIM360 Product Adoption</CardTitle>
        <CardDescription>Tool usage across projects</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={productUsageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#00617f" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProductsTab;