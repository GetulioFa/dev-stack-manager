namespace DevStackManager.Domain.Common
{
    public class Result
    {
        protected Result(bool isSuccess, string? error = null)
        {
            if (isSuccess && error is not null)
                throw new InvalidOperationException("Um resultado bem sucedido não pode ter erro.");
            if (!isSuccess && error is null)
                throw new InvalidOperationException("Um resultado com falha deve ter um erro.");

            IsSuccess = isSuccess;
            Error = error;
        }

        public bool IsSuccess { get; }
        public bool IsFailure => !IsSuccess;
        public string? Error { get; }
        
        public static Result Success() => new(true);
        public static Result Failure(string error) => new(false, error);
        public static Result<T> Success<T>(T value) =>Result<T>.Success(value);
        public static Result<T> Failure<T>(string error) => Result<T>.Failure(error);
    }

    public class Result<T> : Result
    {
        private readonly T? _value;

        private Result(T value) : base(true) => _value = value;
        private Result(string error) : base(false, error) { }

        public T Value => IsSuccess ? _value! : throw new InvalidOperationException("Não é possível acessar o valor de um resultado com falha.");

        public static Result<T> Success(T value) => new(value);
        public new static Result<T> Failure(string error) => new(error);
    }
}
