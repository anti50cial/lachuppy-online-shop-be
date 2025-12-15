export const PERMISSIONS = {
  MANAGE_SIGNUP_CODES: 'manage_signup_codes',
  MANAGE_ADMINS: 'manage_admins',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  CREATE_DISHES: 'create_dishes',
  UPDATE_DISHES: 'update_dishes',
  DROP_DISHES: 'drop_dishes',
  VIEW_ORDERS: 'view_orders',
  MODIFY_ORDERS_STATUS: 'modify_orders_status',
} as const;

export const PERMISSION_DETAILS: { key: PermissionType; label: string }[] = [
  {
    key: PERMISSIONS.MANAGE_SIGNUP_CODES,
    label: 'Generate and invalidate access codes for new admins.',
  },
  {
    key: PERMISSIONS.MANAGE_ADMINS,
    label: 'Suspend or restore lower-level admins',
  },
  {
    key: PERMISSIONS.VIEW_AUDIT_LOGS,
    label: 'See who did what (generatorId relations)',
  },
  {
    key: PERMISSIONS.CREATE_DISHES,
    label: 'Create dishes',
  },
  {
    key: PERMISSIONS.UPDATE_DISHES,
    label: 'Modify dishes descriptions, prices, and availability',
  },
  {
    key: PERMISSIONS.DROP_DISHES,
    label: 'Delete dishes.',
  },
  {
    key: PERMISSIONS.VIEW_ORDERS,
    label: 'View order details.',
  },
  {
    key: PERMISSIONS.MODIFY_ORDERS_STATUS,
    label: 'View and modify order status.',
  },
];
export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
