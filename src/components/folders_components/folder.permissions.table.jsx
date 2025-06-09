import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FolderIcon, ShieldCheckIcon, ShieldXIcon } from "lucide-react";
import * as XLSX from "xlsx";

export default function FolderPermissionsTable({
  folders = [],                // [{ id, name }] or [{ folderId, folderName }]
  flattenedPermissions = [],   // [{ folderId, folderName, permissions: [ { email, actions } ] }]
}) {
  const [userFilter, setUserFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [pendingUserFilter, setPendingUserFilter] = useState("");
  const [pendingFolderFilter, setPendingFolderFilter] = useState("");

  // Normalize input to { folderId, folderName }
  const normalizedFolders = useMemo(
    () =>
      folders.map((f) => ({
        folderId: f.folderId ?? f.id,
        folderName: f.folderName ?? f.name,
      })),
    [folders]
  );

  // Apply filters only when “Apply” is clicked
  const applyFilters = () => {
    setUserFilter(pendingUserFilter.trim());
    setFolderFilter(pendingFolderFilter.trim());
  };

  // Unique emails, filtered
  const users = useMemo(() => {
    const all = new Set(
      flattenedPermissions.flatMap((fp) =>
        (fp.permissions || []).map((p) => p.email)
      )
    );
    return [...all].filter((email) =>
      email.toLowerCase().includes(userFilter.toLowerCase())
    );
  }, [flattenedPermissions, userFilter]);

  // Filter folders by name
  const displayedFolders = useMemo(() => {
    return normalizedFolders.filter((f) =>
      f.folderName.toLowerCase().includes(folderFilter.toLowerCase())
    );
  }, [normalizedFolders, folderFilter]);

  // Lookup actions for (folderId, email)
  const getActions = (folderId, email) => {
    const fp = flattenedPermissions.find((x) => x.folderId === folderId);
    if (!fp) return [];
    const p = (fp.permissions || []).find((u) => u.email === email);
    return p ? p.actions : [];
  };

  // Render permission cell: vertical list of actions
  const renderPermissionCell = (actions) => {
    const has = actions.length > 0;
    return (
      <div className="flex flex-col items-center gap-1 py-1">
        <Badge
          className={`w-full justify-center ${
            has ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {has ? <ShieldCheckIcon className="h-4 w-4 mr-1" /> : <ShieldXIcon className="h-4 w-4 mr-1" />}
          {has ? "Access" : "No Access"}
        </Badge>
        <ul className="w-full list-disc list-inside text-xs text-left mt-1">
          {actions.length > 0
            ? actions.map((act) => <li key={act}>{act}</li>)
            : <li>—</li>}
        </ul>
      </div>
    );
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = users.map((email) => {
      const row = { User: email };
      displayedFolders.forEach((f) => {
        const a = getActions(f.folderId, email);
        row[f.folderName] = a.length ? a.join(", ") : "No Access";
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(data, {
      header: ["User", ...displayedFolders.map((f) => f.folderName)],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Permissions");
    XLSX.writeFile(wb, "Folder_Permissions_Report.xlsx");
  };

  return (
    <div className="space-y-4">
      {/* Filters + Apply + Export */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Filter by user…"
          value={pendingUserFilter}
          onChange={(e) => setPendingUserFilter(e.target.value)}
          className="border px-2 py-1 rounded flex-1"
        />
        <input
          type="text"
          placeholder="Filter by folder…"
          value={pendingFolderFilter}
          onChange={(e) => setPendingFolderFilter(e.target.value)}
          className="border px-2 py-1 rounded flex-1"
        />
        <button
          onClick={applyFilters}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Apply Filters
        </button>
        <button
          onClick={exportToExcel}
          className="bg-gray-800 text-white px-4 py-1 rounded"
        >
          Export Excel
        </button>
      </div>

      {/* Table with horizontal scroll */}
      <div className="overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-10">User</TableHead>
              {displayedFolders.map((folder) => (
                <TableHead
                  key={folder.folderId}
                  className="text-center whitespace-nowrap px-2"
                >
                  <div className="flex flex-col items-center gap-1">
                    <FolderIcon className="h-5 w-5" />
                    <span className="text-xs">{folder.folderName}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((email) => (
              <TableRow key={email}>
                <TableCell className="font-medium sticky left-0 bg-white z-10">
                  {email}
                </TableCell>
                {displayedFolders.map((folder) => (
                  <TableCell
                    key={folder.folderId}
                    className="text-center whitespace-nowrap px-2"
                  >
                    {renderPermissionCell(
                      getActions(folder.folderId, email)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}