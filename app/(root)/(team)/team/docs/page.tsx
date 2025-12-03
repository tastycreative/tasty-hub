"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, Plus, MoreHorizontal, Download, Eye } from "lucide-react";

// Mock data for documents
const documents = [
  { id: "1", name: "Content Guidelines", type: "PDF", size: "2.4 MB", updatedAt: "2024-11-28", category: "Guidelines" },
  { id: "2", name: "Brand Voice Document", type: "DOCX", size: "1.1 MB", updatedAt: "2024-11-25", category: "Branding" },
  { id: "3", name: "AI Prompt Templates", type: "MD", size: "45 KB", updatedAt: "2024-11-30", category: "Templates" },
  { id: "4", name: "Content Calendar Q4", type: "XLSX", size: "890 KB", updatedAt: "2024-11-20", category: "Planning" },
  { id: "5", name: "Style Guide", type: "PDF", size: "5.2 MB", updatedAt: "2024-10-15", category: "Guidelines" },
];

const folders = [
  { id: "1", name: "Guidelines", count: 5 },
  { id: "2", name: "Templates", count: 12 },
  { id: "3", name: "Branding", count: 8 },
  { id: "4", name: "Planning", count: 3 },
];

export default function DocsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Team documents and resources
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {folders.map((folder) => (
          <Card key={folder.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle className="text-base">{folder.name}</CardTitle>
                <CardDescription>{folder.count} files</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>
            Recently updated documents in your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Category</th>
                  <th className="p-3 text-left font-medium">Type</th>
                  <th className="p-3 text-left font-medium">Size</th>
                  <th className="p-3 text-left font-medium">Updated</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{doc.type}</td>
                    <td className="p-3 text-muted-foreground">{doc.size}</td>
                    <td className="p-3 text-muted-foreground">{doc.updatedAt}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
