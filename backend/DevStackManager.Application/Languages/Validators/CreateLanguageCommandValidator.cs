using DevStackManager.Application.Languages.Commands;
using FluentValidation;

namespace DevStackManager.Application.Languages.Validators;
public sealed class CreateLanguageCommandValidator : AbstractValidator<CreateLanguageCommand>
{
    public CreateLanguageCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("O nome da linguagem é obrigatório.")
            .MaximumLength(100).WithMessage("O nome deve ter no máximo 100 caracteres.");
        RuleFor(x => x.Type).IsInEnum().WithMessage("O tipo de linguagem informado é inválido.");
    }
}