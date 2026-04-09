Write-Host "Starting PharmaGuard Backend..."
.\venv\Scripts\Activate
uvicorn main:app --reload
