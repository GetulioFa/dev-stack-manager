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
}
