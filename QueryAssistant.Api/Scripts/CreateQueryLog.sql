CREATE TABLE PCF_QueryAssistantAI_QueryLog (
    Id            INT           IDENTITY(1,1) PRIMARY KEY,
    NLQuery       NVARCHAR(500) NOT NULL,
    GeneratedSql  NVARCHAR(MAX) NOT NULL,
    UsageCount    INT           NOT NULL DEFAULT 1,
    CreatedAt     DATETIME      NOT NULL DEFAULT GETDATE(),
    LastUsedAt    DATETIME      NOT NULL DEFAULT GETDATE()
);
