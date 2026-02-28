namespace BranchOps.Api.Dtos;

public record AuditLogDto(
    Guid Id,
    Guid? UserId,
    string? Username,
    string Action,
    string EntityType,
    Guid? EntityId,
    string Details,
    DateTime Timestamp);
