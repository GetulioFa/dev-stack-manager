using DevStackManager.Application.DTOs;
using DevStackManager.Application.Languages.Commands;
using DevStackManager.Application.Languages.Queries;
using DevStackManager.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevStackManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class LanguagesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResultDto<LanguageDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] LanguageType? type = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new ListLanguagesQuery(page, pageSize, type), cancellationToken);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LanguageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetLanguageByIdQuery(id), cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(LanguageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateLanguageCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status400BadRequest);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(LanguageDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLanguageRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateLanguageCommand(id, request.Name, request.Type), cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteLanguageCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent()
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }
}

public record UpdateLanguageRequest(string Name, LanguageType Type);