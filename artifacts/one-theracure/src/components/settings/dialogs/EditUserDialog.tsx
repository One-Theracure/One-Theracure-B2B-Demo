
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, UserRole, defaultPermissions } from "@/types/userRoles";

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEditUser: (user: User) => void;
}

const EditUserDialog = ({ user, isOpen, onClose, onEditUser }: EditUserDialogProps) => {
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  const togglePermission = (permission: string) => {
    const currentPermissions = editedUser.permissions || user?.permissions || [];
    const updatedPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    setEditedUser({ ...editedUser, permissions: updatedPermissions });
  };

  const handleSave = () => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      ...editedUser,
      name: editedUser.name || user.name,
      email: editedUser.email || user.email,
      role: editedUser.role || user.role,
      permissions: editedUser.permissions || user.permissions
    };

    onEditUser(updatedUser);
    setEditedUser({});
    onClose();
    toast.success('User updated successfully');
  };

  const handleClose = () => {
    setEditedUser({});
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information and permissions</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={editedUser.name ?? user.name}
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editedUser.email ?? user.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select 
              value={editedUser.role ?? user.role} 
              onValueChange={(value: UserRole) => setEditedUser({ ...editedUser, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {defaultPermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Switch
                    checked={(editedUser.permissions ?? user.permissions).includes(permission)}
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

export default EditUserDialog;
