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

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(DeveloperDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetDeveloperByIdQuery(id), cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
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

    [HttpGet("by-email")]
    [Authorize]
    [ProducesResponseType(typeof(DeveloperDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByEmail(
        [FromQuery] string email,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { title = "Requisição inválida", detail = "O parâmetro 'email' é obrigatório.", status = 400 });

        var result = await mediator.Send(new GetDeveloperByEmailQuery(email), cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(DeveloperDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateDeveloperCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            Response.Headers.Location = $"/api/developers/{result.Value.Id}";
            return StatusCode(StatusCodes.Status201Created, result.Value);
        }

        var statusCode = result.Error!.Contains("e-mail", StringComparison.OrdinalIgnoreCase)
            ? StatusCodes.Status409Conflict
            : StatusCodes.Status400BadRequest;

        return StatusCode(statusCode, new { title = "Erro", detail = result.Error, status = statusCode });
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(DeveloperDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateDeveloperRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateDeveloperCommand(
            id, request.Name, request.Email, request.Seniority, request.CityId, request.LanguageIds);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess) return Ok(result.Value);

        var statusCode = result.Error!.Contains("não encontrado", StringComparison.OrdinalIgnoreCase)
            ? StatusCodes.Status404NotFound
            : StatusCodes.Status409Conflict;

        return StatusCode(statusCode, new { title = "Erro", detail = result.Error, status = statusCode });
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteDeveloperCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent()
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }
}

public record UpdateDeveloperRequest(
    string Name,
    string Email,
    Seniority Seniority,
    Guid CityId,
    IEnumerable<Guid> LanguageIds
);
