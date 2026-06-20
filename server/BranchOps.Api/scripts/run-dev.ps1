$ErrorActionPreference = "Stop"

$openAiKey = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "User")
if ([string]::IsNullOrWhiteSpace($openAiKey)) {
    $openAiKey = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "Machine")
}

if ([string]::IsNullOrWhiteSpace($openAiKey)) {
    throw "OPENAI_API_KEY is not set in User or Machine environment variables. Set it with: [Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'your_key_here', 'User')"
}

$env:Ai__OpenAI__ApiKey = $openAiKey

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
    dotnet run --launch-profile https
}
finally {
    Pop-Location
}
