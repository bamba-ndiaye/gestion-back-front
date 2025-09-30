# TODO: Add Employees Tab to SuperAdminDashboard with Dynamic Updates

## Steps to Complete

- [x] Add Tabs component to SuperAdminDashboard.jsx with Companies and Employees tabs
- [x] Add useQuery for employees with queryKey ['employees'] in Employees tab
- [x] Add employee list UI in Employees tab (similar to AdministratorDashboard)
- [x] Add state management for showEmployeeForm and selectedEmployee
- [x] Add handleCreateEmployee, handleEditEmployee, and handleEmployeeSubmit functions
- [x] Add Dialog component for EmployeeForm in Employees tab
- [x] Ensure query invalidation in handleEmployeeSubmit uses ['employees'] queryKey
- [x] Update stats to include total employees count
- [ ] Test dynamic update of employee list after adding employee as SUPER_ADMIN
- [ ] Verify UI consistency and functionality
