
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { Role, defaultPermissions } from "@/types/userRoles";

interface AddRoleDialogProps {
  onAddRole: (role: Role) => void;
}

const AddRoleDialog = ({ onAddRole }: AddRoleDialogProps) => {
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const togglePermission = (permission: string) => {
    const currentPermissions = newRole.permissions;
    const updatedPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    setNewRole({ ...newRole, permissions: updatedPermissions });
  };

  const handleAddRole = () => {
    if (!newRole.name || !newRole.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions
    };

    onAddRole(role);
    setNewRole({ name: '', description: '', permissions: [] });
    setShowAddRole(false);
    toast.success('Role created successfully');
  };

  return (
    <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Shield className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>Define a new role with specific permissions</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              placeholder="Enter role name"
            />
          </div>
          <div>
            <Label htmlFor="roleDescription">Description</Label>
            <Input
              id="roleDescription"
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              placeholder="Enter role description"
            />
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {defaultPermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Switch
                    checked={newRole.permissions.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                  />
                  <Label className="text-sm">{permission.replace('_', ' ')}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddRole(false)}>Cancel</Button>
            <Button onClick={handleAddRole}>Create Role</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoleDialog;
