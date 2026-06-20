using DevStackManager.Application.States.Commands;
using FluentValidation;

namespace DevStackManager.Application.States.Validators;

public sealed class CreateStateCommandValidator : AbstractValidator<CreateStateCommand>
{
    public CreateStateCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome do estado é obrigatório.")
            .MaximumLength(100).WithMessage("O nome deve ter no máximo 100 caracteres.");

        RuleFor(x => x.UF)
            .NotEmpty().WithMessage("A UF é obrigatória.")
            .Length(2).WithMessage("A UF deve conter exatamente 2 caracteres.")
            .Matches("^[a-zA-Z]+$").WithMessage("A UF deve conter apenas letras.");
    }

    public sealed class UpdateStateCommandValidator : AbstractValidator<UpdateStateCommand>
    {
        public UpdateStateCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("O ID do estado é obrigatório.");
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome do estado é obrigatório.")
                .MaximumLength(100).WithMessage("O nome deve ter no máximo 100 caracteres.");
            RuleFor(x => x.UF)
                .NotEmpty().WithMessage("A UF é obrigatória.")
                .Length(2).WithMessage("A UF deve conter exatamente 2 caracteres.")
                .Matches("^[a-zA-Z]+$").WithMessage("A UF deve conter apenas letras.");
        }
    }
}