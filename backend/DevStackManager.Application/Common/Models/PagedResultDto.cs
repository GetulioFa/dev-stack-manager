namespace DevStackManager.Application.Common.Models
{
    public sealed class PagedResultDto<T>
    {
        public IEnumerable<T> Items { get; init; } = [];
        public int TotalCount { get; init; }
        public int PageNumber { get; init; }
        public int PageSize { get; init;  }

        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}
