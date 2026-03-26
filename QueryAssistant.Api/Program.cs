using QueryAssistant.Api.Endpoints;
using QueryAssistant.Api.Interfaces;
using QueryAssistant.Api.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient<ILLMService, GeminiService>();
builder.Services.AddSingleton<PromptService>();
builder.Services.AddScoped<QueryService>();
builder.Services.AddSingleton<SqlSafetyService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("DevCors");
app.UseHttpsRedirection();

app.MapHealthEndpoints();
app.MapChatEndpoints();

app.Run();