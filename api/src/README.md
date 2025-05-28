# Audit Trail System

This system provides automatic audit logging for all database operations in the application. It tracks who made changes, what was changed, and when the changes occurred.

## Features

- **Automatic change tracking**: Records are automatically audited when they are created, updated, or deleted.
- **User context**: Changes are associated with the user who made them.
- **Before/after values**: Both old and new values are stored for updates.
- **Entity history**: You can view the complete history of changes for any entity.
- **API access**: Query and filter audit logs through REST endpoints.
- **Sensitive data protection**: Sensitive fields are automatically removed from audit logs.

## Implementation

The audit system uses two complementary approaches:

1. **TypeORM Entity Subscribers**: Automatically hooks into TypeORM's entity lifecycle events to create audit records.
2. **Method Decorators**: Provides a way to manually decorate specific service methods for more control.

### Key Components

- `AuditLog` entity: Stores the audit trail records
- `AuditSubscriber`: TypeORM subscriber that listens to entity lifecycle events
- `AuditContext`: Stores the current user context during requests
- `AuditDecorator`: Method decorators to manually add auditing to specific methods

## Usage

### Automatic Auditing via Entity Subscriber

All entities that extend `AbstractEntity` will automatically be audited when:
- Created (INSERT)
- Updated (UPDATE)
- Deleted (DELETE)

### Manual Auditing via Decorators

For more control, you can use the `@AuditUpdate` and `@AuditDelete` decorators:

```typescript
@AuditUpdate({
  entityType: 'EntityName',
  getEntityId: (args) => args[0],
  getUserId: (args) => args[1]?.userId
})
async updateEntity(id: UUID, data: Partial<Entity>): Promise<Entity> {
  // Method implementation
}

@AuditDelete({
  entityType: 'EntityName',
  getEntityId: (args) => args[0],
})
async deleteEntity(id: UUID): Promise<void> {
  // Method implementation
}
```

## API Endpoints

### Get All Audit Logs

```
GET /api/audit-logs
```

Query parameters:
- `page`: Page number (default: 1)
- `size`: Page size (default: 10)
- `entityType`: Filter by entity type
- `entityId`: Filter by entity ID
- `action`: Filter by action type (CREATE, UPDATE, DELETE)
- `userId`: Filter by user ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date

### Get Entity History

```
GET /api/audit-logs/entity/:entityType/:entityId
```

Returns all audit logs for a specific entity in chronological order.

## Security Considerations

- Audit logs may contain sensitive information and should be accessible only to authorized users.
- The system automatically removes sensitive fields like passwords and API keys from audit logs.
- Consider implementing a data retention policy for audit logs. 