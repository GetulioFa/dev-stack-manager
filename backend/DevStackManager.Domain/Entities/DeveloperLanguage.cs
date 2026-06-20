namespace DevStackManager.Domain.Entities
{
    public sealed class DeveloperLanguage
    {
        private DeveloperLanguage() { }

        public DeveloperLanguage(Guid developerId, Guid programmingLanguageId)
        {
            DeveloperId = developerId;
            ProgrammingLanguageId = programmingLanguageId;
            AssociatedAt = DateTime.UtcNow;
        }

        public Guid DeveloperId { get; private set; }
        public Guid ProgrammingLanguageId { get; private set; }
        public DateTime AssociatedAt { get; private set; }

        public Developer Developer { get; private set; } = null!;
        public ProgrammingLanguage ProgrammingLanguage { get; private set; } = null!;

    }
}
