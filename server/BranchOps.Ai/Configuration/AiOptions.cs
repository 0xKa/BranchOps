namespace BranchOps.Ai.Configuration;

/// <summary>
/// Strongly-typed configuration bound from the "Ai" section of appsettings.
/// Registered via services.Configure&lt;AiOptions&gt;(config.GetSection("Ai")).
/// </summary>
public sealed class AiOptions
{
    public OpenAiSection OpenAI { get; set; } = new();
    public ReplenishmentSection Replenishment { get; set; } = new();
    public AskBranchOpsSection AskBranchOps { get; set; } = new();

    public sealed class OpenAiSection
    {
        /// <summary>OpenAI API key. NEVER committed -- supply via user-secrets in dev or env var in prod.</summary>
        public string ApiKey { get; set; } = "";

        /// <summary>Model id passed to OpenAIClient.GetChatClient(model). Default is the cheap recommendation.</summary>
        public string Model { get; set; } = "gpt-5-mini";

        /// <summary>Optional OpenAI organization id; null in most cases.</summary>
        public string? Organization { get; set; }
    }

    public sealed class ReplenishmentSection
    {
        /// <summary>Hard cap on agent tool-call iterations per run; the middleware terminates the loop above this.</summary>
        public int MaxToolIterations { get; set; } = 20;

        /// <summary>Default sales-history window (days) the agent uses for velocity calculations.</summary>
        public int DefaultLookbackDays { get; set; } = 30;

        /// <summary>Cap on the number of products the orchestrator will persist as recommendations per run.</summary>
        public int MaxProductsPerRun { get; set; } = 25;
    }

    public sealed class AskBranchOpsSection
    {
        public int MaxToolIterations { get; set; } = 8;
        public int DefaultLookbackDays { get; set; } = 30;
        public int MaxTableRows { get; set; } = 10;
        public int MaxMessageLength { get; set; } = 1000;
        public int MaxHistoryMessages { get; set; } = 6;
    }
}
