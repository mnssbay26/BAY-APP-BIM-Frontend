import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const DetailsTab = ({ projects }) => {
  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {project.city && project.country ? `${project.city}, ${project.country}` : project.country || 'Location not specified'}
                </CardDescription>
              </div>
              <Badge variant={project.status === "active" ? "default" : "secondary"}>
                {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : "Unknown"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Members</p>
                <p className="font-semibold">{project.memberCount || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Companies</p>
                <p className="font-semibold">{project.companyCount || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-semibold">{project.type || project.constructionType || "Unknown"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Update</p>
                <p className="font-semibold">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            {project.products && project.products.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">BIM360 Products:</p>
                <div className="flex flex-wrap gap-2">
                  {project.products.slice(0, 5).map((product, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {product.name || product.key || product}
                    </Badge>
                  ))}
                  {project.products.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.products.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DetailsTab;