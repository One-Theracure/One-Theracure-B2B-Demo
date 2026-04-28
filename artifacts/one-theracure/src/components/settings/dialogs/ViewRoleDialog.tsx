
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/types/userRoles";

interface ViewRoleDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewRoleDialog = ({ role, isOpen, onClose }: ViewRoleDialogProps) => {
  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role.name}</DialogTitle>
          <DialogDescription>{role.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Permissions ({role.permissions.length})</h4>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="text-sm">
                  {permission.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRoleDialog;
