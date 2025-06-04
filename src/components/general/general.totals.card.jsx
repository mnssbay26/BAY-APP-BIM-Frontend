import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";

function getIconByType(type) {
  switch (type) {
    case "total_issues":
      return <MessageSquare className="h-3 w-3 text-gray-500" />;
    case "open_issues":
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    case "answered_issues":
    case "answered_rfis":
      return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    case "closed_issues":
    case "closed_rfis":
    case "closed_submittals":
      return <CheckCircle2 className="h-3 w-3 text-gray-500" />;
    case "completed_issues":
      return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
    case "total_rfis":
    case "total_submittals":
      return <FileText className="h-3 w-3 text-gray-500" />;
    case "waiting_submittals":
    case "inreview_submittals":
    case "submitted_submittals":
      return <Clock className="h-3 w-3 text-yellow-500" />;
    case "total_users":
    case "active_users":
      return <Users className="h-3 w-3 text-purple-500" />;
    case "open_rfis":
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    default:
      return <Clock className="h-3 w-3 text-gray-400" />;
  }
}

export function TotalsCard({ title, value, description, type }) {
  return (
    <Card className="w-full h-[105px]">
      <CardHeader className="flex justify-between items-center pb-1">
        <CardTitle className="text-sm text-center font-medium text-gray-800 p-0 mb-0 pb-0">{title}</CardTitle>
        {getIconByType(type)}
      </CardHeader>
      <CardContent className="pt-1">
        <div className="text-2xl text-center font-bold text-gray-800">{value}</div>
        {description && (
          <p className="text-xs text-gray-600">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}