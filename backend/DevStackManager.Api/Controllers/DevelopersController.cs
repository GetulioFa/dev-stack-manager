using DevStackManager.Application.Developers.Commands;
using DevStackManager.Application.Developers.Queries;
using DevStackManager.Application.DTOs;
using DevStackManager.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevStackManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class DevelopersController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(DeveloperDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateDeveloperCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetByEmail), new { email = result.Value.Email }, result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status409Conflict);
    }

    [HttpPut("{email}")]
    [Authorize]
    [ProducesResponseType(typeof(DeveloperDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(string email,[FromBody] UpdateDeveloperRequest request, CancellationToken cancellationToken)
    {
        var command = new UpdateDeveloperCommand(
            request.Name, request.Email, request.Seniority, request.CityId, request.LanguageIds);

        var result = await mediator.Send(command, cancellationToken);
        
        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpDelete("{email}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(string email, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteDeveloperCommand(email), cancellationToken);
        
        return result.IsSuccess ? NoContent()
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpGet("{email}")]
    [Authorize]
    [ProducesResponseType(typeof(DeveloperDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByEmail([FromQuery] string email, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetDeveloperByEmailQuery(email), cancellationToken);
        
        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagedResultDto<DeveloperDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] Seniority? seniority = null,
        [FromQuery] Guid? cityId = null,
        [FromQuery] Guid? languageId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ListDevelopersQuery(page, pageSize, seniority, cityId, languageId), cancellationToken);
        
        return Ok(result.Value);
    }

    [HttpGet("export")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<DeveloperExportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Export(
        [FromQuery] Seniority? seniority = null,
        [FromQuery] Guid? cityId = null,
        [FromQuery] Guid? languageId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new ExportDevelopersQuery(seniority, cityId, languageId), cancellationToken);
        
        return Ok(result.Value);
    }

    public record UpdateDeveloperRequest(
    string Name,
    string Email,
    Seniority Seniority,
    Guid CityId,
    IEnumerable<Guid> LanguageIds
    );
}