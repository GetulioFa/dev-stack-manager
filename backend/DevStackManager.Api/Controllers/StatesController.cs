using DevStackManager.Application.DTOs;
using DevStackManager.Application.States.Commands;
using DevStackManager.Application.States.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevStackManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class StatesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResultDto<StateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new ListStatesQuery(page, pageSize), ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(StateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetStateByIdQuery(id), ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(StateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateStateCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status409Conflict);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(StateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStateRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateStateCommand(id, request.Name, request.UF), ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteStateCommand(id), ct);
        return result.IsSuccess ? NoContent()
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }
}

public record UpdateStateRequest(string Name, string UF);