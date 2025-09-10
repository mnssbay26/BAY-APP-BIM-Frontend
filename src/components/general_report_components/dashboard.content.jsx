import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import GeographicTab from "./charts/GeographicTab";
import ConstructionTypesTab from "./charts/ConstructionTypesTab";
import ProductsTab from "./charts/ProductsTab";
import DetailsTab from "./charts/DetailsTab";

const DashboardContent = ({
  filteredProjects,
  chartData,
}) => {
  return (
    <div className="mt-8">
      <Tabs defaultValue="geographic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geographic">Geographic Analysis</TabsTrigger>
          <TabsTrigger value="construction">Construction Types</TabsTrigger>
          <TabsTrigger value="products">BIM360 Products</TabsTrigger>
          <TabsTrigger value="details">Project Details</TabsTrigger>
        </TabsList>

        <TabsContent value="geographic" className="space-y-6">
          <GeographicTab chartData={chartData} />
        </TabsContent>

        <TabsContent value="construction" className="space-y-6">
          <ConstructionTypesTab chartData={chartData} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductsTab chartData={chartData} />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <DetailsTab projects={filteredProjects} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardContent;