namespace DevStackManager.Application.DTOs;

public record CityDto(Guid Id, string Name, Guid StateId, string StateName, string StateUF, DateTime CreatedAt);
