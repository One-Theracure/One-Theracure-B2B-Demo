
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Role, defaultPermissions } from "@/types/userRoles";

interface EditRoleDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onEditRole: (role: Role) => void;
}

const EditRoleDialog = ({ role, isOpen, onClose, onEditRole }: EditRoleDialogProps) => {
  const [editedRole, setEditedRole] = useState<Partial<Role>>({});

  const togglePermission = (permission: string) => {
    const currentPermissions = editedRole.permissions || role?.permissions || [];
    const updatedPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    setEditedRole({ ...editedRole, permissions: updatedPermissions });
  };

  const handleSave = () => {
    if (!role) return;

    const updatedRole: Role = {
      ...role,
      ...editedRole,
      name: editedRole.name || role.name,
      description: editedRole.description || role.description,
      permissions: editedRole.permissions || role.permissions
    };

    onEditRole(updatedRole);
    setEditedRole({});
    onClose();
    toast.success('Role updated successfully');
  };

  const handleClose = () => {
    setEditedRole({});
    onClose();
  };

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>Update role information and permissions</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              value={editedRole.name ?? role.name}
              onChange={(e) => setEditedRole({ ...editedRole, name: e.target.value })}
              placeholder="Enter role name"
            />
          </div>
          <div>
            <Label htmlFor="roleDescription">Description</Label>
            <Input
              id="roleDescription"
              value={editedRole.description ?? role.description}
              onChange={(e) => setEditedRole({ ...editedRole, description: e.target.value })}
              placeholder="Enter role description"
            />
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {defaultPermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Switch
                    checked={(editedRole.permissions ?? role.permissions).includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                  />
                  <Label className="text-sm">{permission.replace('_', ' ')}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
