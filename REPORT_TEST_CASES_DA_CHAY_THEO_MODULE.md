# REPORT_TEST_CASES_DA_CHAY_THEO_MODULE

- Nguon: Regression suite Playwright (`tests/e2e/regression-*.spec.ts`)
- Ket qua run cuoi cung: PASS (`test-results/.last-run.json`)
- Thoi gian tao report: 2026-04-06T15:59:58.831Z
- Tong so test case da chay thanh cong: 112

## Tong quan theo module

| Module | So test case pass |
|---|---:|
| Admin/Dashboard | 5 |
| Admin/Settings | 1 |
| Admin/Verification | 1 |
| API/Admin | 7 |
| API/Chat | 1 |
| API/Contracts | 4 |
| API/Invoices | 4 |
| API/Properties | 5 |
| API/Rooms | 1 |
| API/Services | 3 |
| API/Tenant | 11 |
| API/VNPay | 2 |
| Auth | 17 |
| Authorization | 5 |
| Owner/Contracts | 4 |
| Owner/Dashboard | 3 |
| Owner/Invoices | 3 |
| Owner/Properties | 5 |
| Owner/Rooms | 1 |
| Owner/Services | 4 |
| Owner/Settings | 2 |
| Owner/Tenants | 3 |
| Tenant/Contracts | 3 |
| Tenant/Dashboard | 6 |
| Tenant/Invoices | 4 |
| Tenant/Notifications | 1 |
| Tenant/Room | 2 |
| Tenant/Services | 1 |
| UI | 3 |

## Admin/Dashboard (5)

- admin dashboard loads
- admin dashboard shows pending and active tabs
- admin dashboard table is visible
- admin filters can switch back and forth
- admin tab switching highlights pending landlords

## Admin/Settings (1)

- admin settings page loads

## Admin/Verification (1)

- admin landlord verify endpoint is reachable

## API/Admin (7)

- admin can read admin API
- admin can read landlords API
- admin can read users API
- unauthorized admin API is blocked
- unauthorized admin landlord verify API is blocked
- unauthorized admin landlords API is blocked
- unauthorized admin users API is blocked

## API/Chat (1)

- tenant chat API accepts message

## API/Contracts (4)

- owner can read contract detail API
- owner can read contracts API
- unauthorized contract detail API is blocked
- unauthorized contracts API is blocked

## API/Invoices (4)

- owner can read invoice detail API
- owner can read invoices API
- unauthorized invoice detail API is blocked
- unauthorized invoices API is blocked

## API/Properties (5)

- owner can create property through API
- owner can read properties API
- owner can read property detail API
- unauthorized properties API is blocked
- unauthorized property detail API is blocked

## API/Rooms (1)

- unauthorized rooms API is blocked

## API/Services (3)

- owner can create service through API
- owner can read services API
- unauthorized services API is blocked

## API/Tenant (11)

- tenant can read contract detail API
- tenant can read contract list API
- tenant can read dashboard API
- tenant can read invoices API
- tenant can read notifications API
- tenant can read services API
- unauthorized tenant contracts API is blocked
- unauthorized tenant dashboard API is blocked
- unauthorized tenant invoices API is blocked
- unauthorized tenant notifications API is blocked
- unauthorized tenant services API is blocked

## API/VNPay (2)

- tenant can create VNPay payment url
- tenant payment endpoint is reachable

## Auth (17)

- admin login redirects to admin dashboard
- change password requires auth
- duplicate email registration shows validation
- empty login fields stay on login page
- forgot password validation rejects empty payload
- forgot password with invalid email remains on page
- login validation rejects empty payload
- login validation rejects missing email
- login validation rejects missing password
- logout returns to login
- owner login redirects to owner dashboard
- owner settings blocks empty password change
- owner settings blocks short password change
- owner settings blocks wrong current password
- register validation rejects empty payload
- tenant login redirects to tenant dashboard
- wrong password shows login error

## Authorization (5)

- owner cannot stay on admin dashboard
- tenant cannot stay on admin dashboard
- unauthenticated admin dashboard redirects to login
- unauthenticated owner dashboard redirects to login
- unauthenticated tenant dashboard redirects to login

## Owner/Contracts (4)

- owner contract detail page loads from first contract link
- owner contract detail shows renew action when active
- owner contracts list navigation link is visible
- owner contracts page loads

## Owner/Dashboard (3)

- owner can read dashboard stats API
- owner dashboard loads
- owner dashboard shows overdue section

## Owner/Invoices (3)

- owner dashboard invoice link is visible
- owner invoices page loads
- owner invoices search input is visible

## Owner/Properties (5)

- owner properties create form toggles
- owner properties list navigation link is visible
- owner properties page loads
- owner properties page shows property cards
- owner property detail page loads from first property link

## Owner/Rooms (1)

- owner room management page loads from property detail

## Owner/Services (4)

- owner services create form toggles
- owner services edit form opens
- owner services page loads
- owner services rejects invalid price

## Owner/Settings (2)

- owner settings blocks mismatched confirmation
- owner settings page loads

## Owner/Tenants (3)

- owner tenants form shows available room selector
- owner tenants page loads
- owner tenants search input is visible

## Tenant/Contracts (3)

- tenant contract detail page loads from first contract link
- tenant contracts list navigation link is visible
- tenant contracts page loads

## Tenant/Dashboard (6)

- tenant chat GET endpoint is available
- tenant dashboard loads
- tenant dashboard room card loads
- tenant dashboard shows failure message from query string
- tenant dashboard shows success message from query string
- tenant settings page loads

## Tenant/Invoices (4)

- tenant invoices controls are clickable
- tenant invoices empty month/year combination shows empty state
- tenant invoices page loads
- tenant invoices search input is visible

## Tenant/Notifications (1)

- tenant notifications can be dismissed

## Tenant/Room (2)

- tenant room page loads
- tenant room services table is visible

## Tenant/Services (1)

- tenant services page loads

## UI (3)

- admin settings theme toggle is visible
- owner settings theme toggle is visible
- tenant settings theme toggle is visible
