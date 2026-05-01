
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { User } from "@/types/userRoles";
import AddUserDialog from "../dialogs/AddUserDialog";
import EditUserDialog from "../dialogs/EditUserDialog";

interface UsersSectionProps {
  users: User[];
  onAddUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const UsersSection = ({ users, onAddUser, onEditUser, onToggleUserStatus, onDeleteUser }: UsersSectionProps) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setEditingUser(null);
    setShowEditDialog(false);
  };

  return (
    <>
      <Card className="bg-card border border-border">
        <CardHeader className="bg-muted/30 rounded-t-airbnb-md border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-display-md text-brand-navy">
                Users
              </CardTitle>
              <CardDescription className="font-inter font-medium text-muted-foreground text-sm sm:text-base">
                Manage user accounts and their access
              </CardDescription>
            </div>
            <AddUserDialog onAddUser={onAddUser} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="border border-border rounded-lg p-4 bg-muted/40">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-foreground">{user.name}</h3>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-sm">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => onToggleUserStatus(user.id)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <EditUserDialog 
        user={editingUser}
        isOpen={showEditDialog}
        onClose={handleCloseEditDialog}
        onEditUser={onEditUser}
      />
    </>
  );
};

export default UsersSection;
