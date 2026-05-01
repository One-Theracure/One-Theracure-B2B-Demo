
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit2, Trash2, FileText, Copy } from "lucide-react";
import { medicalTemplates, templateCategories, MedicalTemplate } from "@/data/medicalTemplates";
import { useToast } from "@/hooks/use-toast";

const TemplateManagement = () => {
  const [templates, setTemplates] = useState<MedicalTemplate[]>(medicalTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MedicalTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "",
    content: ""
  });
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.category || !newTemplate.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const template: MedicalTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      category: newTemplate.category,
      content: newTemplate.content,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setTemplates(prev => [template, ...prev]);
    setNewTemplate({ name: "", category: "", content: "" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Template Added",
      description: `${template.name} has been added successfully`
    });
  };

  const handleEditTemplate = (template: MedicalTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      category: template.category,
      content: template.content
    });
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !newTemplate.name || !newTemplate.category || !newTemplate.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setTemplates(prev => prev.map(template => 
      template.id === editingTemplate.id 
        ? {
            ...template,
            name: newTemplate.name,
            category: newTemplate.category,
            content: newTemplate.content,
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : template
    ));

    setEditingTemplate(null);
    setNewTemplate({ name: "", category: "", content: "" });
    
    toast({
      title: "Template Updated",
      description: `${newTemplate.name} has been updated successfully`
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
    toast({
      title: "Template Deleted",
      description: "Template has been deleted successfully"
    });
  };

  const handleCopyTemplate = (template: MedicalTemplate) => {
    navigator.clipboard.writeText(template.content);
    toast({
      title: "Content Copied",
      description: "Template content copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-airbnb-md border border-border p-6">
        <h2 className="text-2xl font-bold font-playfair text-foreground mb-2">
          Medical Templates
        </h2>
        <p className="text-muted-foreground font-inter font-medium">
          Manage and organize your medical documentation templates
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {templateCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {templateCategories.filter(cat => cat !== "All").map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Template Content</Label>
                    <Textarea
                      id="content"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter template content..."
                      className="min-h-[300px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTemplate}>
                      Add Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="bg-card border border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {template.name}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {template.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-3 max-h-48 overflow-y-auto">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                  {template.content}
                </pre>
              </div>
              <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
                <span>Created: {template.createdAt}</span>
                <span>Updated: {template.updatedAt}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Template Name</Label>
              <Input
                id="edit-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {templateCategories.filter(cat => cat !== "All").map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content">Template Content</Label>
              <Textarea
                id="edit-content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter template content..."
                className="min-h-[300px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate}>
                Update Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredTemplates.length === 0 && (
        <Card className="bg-card border border-border">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "All"
                ? "No templates match your search criteria." 
                : "Start by adding your first medical template."}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateManagement;
