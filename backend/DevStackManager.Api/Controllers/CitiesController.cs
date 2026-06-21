using DevStackManager.Application.Cities.Command;
using DevStackManager.Application.Cities.Queries;
using DevStackManager.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevStackManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class CitiesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResultDto<CityDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] Guid? stateId = null,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new ListCitiesQuery(page, pageSize, stateId), ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCityByIdQuery(id), cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(CityDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCityCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status400BadRequest);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(CityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCityCommand request, CancellationToken cancellationToken)
    {
        var command = new UpdateCityCommand(id, request.Name, request.StateId);
        var result = await mediator.Send(command, cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteCityCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent()
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }
}
