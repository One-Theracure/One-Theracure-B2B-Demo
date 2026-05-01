
import { useState } from "react";
import { toast } from "sonner";
import { User, Role, mockUsers, defaultRoles } from "@/types/userRoles";
import UsersSection from "./sections/UsersSection";
import RolesSection from "./sections/RolesSection";

const UserRoleManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [roles, setRoles] = useState<Role[]>(defaultRoles);

  const handleAddUser = (user: User) => {
    setUsers([...users, user]);
    toast.success('User added successfully');
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    toast.success('User updated successfully');
  };

  const handleAddRole = (role: Role) => {
    setRoles([...roles, role]);
    toast.success('Role created successfully');
  };

  const handleEditRole = (updatedRole: Role) => {
    setRoles(roles.map(role => 
      role.id === updatedRole.id ? updatedRole : role
    ));
    toast.success('Role updated successfully');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
    toast.success('User status updated');
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success('User deleted successfully');
  };

  const deleteRole = (roleId: string) => {
    setRoles(roles.filter(role => role.id !== roleId));
    toast.success('Role deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-airbnb-md border border-border p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-playfair text-foreground mb-2">
          User Roles & Permissions
        </h2>
        <p className="text-muted-foreground font-inter font-medium text-sm sm:text-base">
          Manage user accounts, roles, and access permissions
        </p>
      </div>

      <UsersSection 
        users={users}
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
        onToggleUserStatus={toggleUserStatus}
        onDeleteUser={deleteUser}
      />

      <RolesSection 
        roles={roles}
        onAddRole={handleAddRole}
        onEditRole={handleEditRole}
        onDeleteRole={deleteRole}
      />
    </div>
  );
};

export default UserRoleManagement;
