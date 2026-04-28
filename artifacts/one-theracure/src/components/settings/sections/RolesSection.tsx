
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { Role } from "@/types/userRoles";
import AddRoleDialog from "../dialogs/AddRoleDialog";
import EditRoleDialog from "../dialogs/EditRoleDialog";
import ViewRoleDialog from "../dialogs/ViewRoleDialog";

interface RolesSectionProps {
  roles: Role[];
  onAddRole: (role: Role) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (roleId: string) => void;
}

const RolesSection = ({ roles, onAddRole, onEditRole, onDeleteRole }: RolesSectionProps) => {
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleViewRole = (role: Role) => {
    setViewingRole(role);
    setShowViewDialog(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowEditDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewingRole(null);
    setShowViewDialog(false);
  };

  const handleCloseEditDialog = () => {
    setEditingRole(null);
    setShowEditDialog(false);
  };

  return (
    <>
      <Card className="bg-card/90 backdrop-blur-xl border border-border/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-playfair text-lg sm:text-xl bg-gradient-to-r from-blue-800 to-indigo-800 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Roles
              </CardTitle>
              <CardDescription className="font-inter font-medium text-muted-foreground text-sm sm:text-base">
                Define roles and their permissions
              </CardDescription>
            </div>
            <AddRoleDialog onAddRole={onAddRole} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="border border-border rounded-lg p-4 bg-muted/40">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-foreground">{role.name}</h3>
                      <Badge variant="outline">{role.permissions.length} permissions</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-sm">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-sm">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewRole(role)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteRole(role.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ViewRoleDialog 
        role={viewingRole}
        isOpen={showViewDialog}
        onClose={handleCloseViewDialog}
      />

      <EditRoleDialog 
        role={editingRole}
        isOpen={showEditDialog}
        onClose={handleCloseEditDialog}
        onEditRole={onEditRole}
      />
    </>
  );
};

export default RolesSection;
