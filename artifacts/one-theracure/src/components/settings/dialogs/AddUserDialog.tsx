
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { User, UserRole, defaultPermissions } from "@/types/userRoles";

interface AddUserDialogProps {
  onAddUser: (user: User) => void;
}

const AddUserDialog = ({ onAddUser }: AddUserDialogProps) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'nurse' as UserRole,
    permissions: [] as string[]
  });

  const togglePermission = (permission: string) => {
    const currentPermissions = newUser.permissions;
    const updatedPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    setNewUser({ ...newUser, permissions: updatedPermissions });
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      permissions: newUser.permissions,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddUser(user);
    setNewUser({ name: '', email: '', role: 'nurse', permissions: [] });
    setShowAddUser(false);
    toast.success('User added successfully');
  };

  return (
    <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
      <DialogTrigger asChild>
        <Button className="bg-brand-trust hover:bg-brand-navy text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user account with specific role and permissions</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}>
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
                    checked={newUser.permissions.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                  />
                  <Label className="text-sm">{permission.replace('_', ' ')}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
