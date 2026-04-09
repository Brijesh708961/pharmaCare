@echo off
echo Starting PharmaGuard Backend...
call venv\Scripts\activate
uvicorn main:app --reload
