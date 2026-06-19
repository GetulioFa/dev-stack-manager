namespace DevStackManager.Application.DTOs
{
    public record UserDto(
        Guid Id,
        string Name,
        string Email,
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );
    public record AuthTokenDto(
        string Token,
        string TokenType,
        DateTime ExpiresAt,
        UserDto User
    );

    public record PagedResultDto<T>(
        IEnumerable<T> Items,
        int Page,
        int PageSize,
        int TotalCount,
        int TotalPages
    );
}
