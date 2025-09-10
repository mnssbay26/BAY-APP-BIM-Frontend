import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users, Globe, Package, Briefcase } from "lucide-react";

const DashboardMetrics = ({
  metrics,
  countries,
  selectedCountry,
  setSelectedCountry,
  selectedStatus,
  setSelectedStatus,
  statuses,
  filteredProjects = [], 
}) => {
  const {
    totalProjects,
    activeProjects,
    totalMembers,
    totalCompanies,
    totalValue,
  } = metrics || {}; 

  const uniqueProducts = new Set();
  
  if (Array.isArray(filteredProjects)) {
    filteredProjects.forEach((project) => {
      if (project.products && Array.isArray(project.products)) {
        project.products.forEach((product) => {
          const productName = product.name || product.key || product;
          if (typeof productName === 'string') {
            uniqueProducts.add(productName);
          }
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Filtros por país */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <Globe className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filter by:</span>
        
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {(countries || []).map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(statuses || []).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-gray-500">
          Showing {filteredProjects.length} projects
        </div>
      </div>

      {/* 5 Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#00bcff" }}>
              {totalProjects || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeProjects || 0} active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#00bcff" }}>
              {(totalMembers || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round((totalMembers || 0) / Math.max((totalProjects || 1), 1))} per project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#00bcff" }}>
              {totalCompanies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round((totalCompanies || 0) / Math.max((totalProjects || 1), 1))} per project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#00bcff" }}>
              {(countries || []).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedCountry !== "all" ? selectedCountry : "All regions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BIM360 Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#00bcff" }}>
              {uniqueProducts.size}
            </div>
            <p className="text-xs text-muted-foreground">
              Products in use
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;