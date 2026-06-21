using DevStackManager.Application.Cities.Command;
using FluentValidation;

namespace DevStackManager.Application.Cities.Validators;

public sealed class UpdateCityCommandValidator : AbstractValidator<UpdateCityCommand>
{
    public UpdateCityCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("O ID da cidade é obrigatório.");
        RuleFor(x => x.Name).NotEmpty().WithMessage("O nome da cidade é obrigatório.")
            .MaximumLength(150).WithMessage("O nome deve ter no máximo 150 caracteres.");
        RuleFor(x => x.StateId).NotEmpty().WithMessage("O estado é obrigatório.");
    }
}