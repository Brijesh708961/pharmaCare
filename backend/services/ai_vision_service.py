import os
import re
from google import genai
from google.genai import types

class AIVisionService:
    @staticmethod
    def extract_drug_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is missing")
            
        client = genai.Client(api_key=api_key)
        
        prompt = "You are an expert pharmacist. Read this pill bottle label image and identify the generic/active drug ingredient. Return ONLY the exact drug name in lowercase (for example: clopidogrel, warfarin, aspirin, codeine, simvastatin, azathioprine, fluorouracil). Return nothing else, just the pure valid drug name."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            ]
        )
        
        # Clean up the response
        drug_name = response.text.strip().lower()
        # Remove any leading/trailing punctuation or quotes if they exist
        drug_name = re.sub(r'[^a-z0-9\s-]', '', drug_name).strip()
        
        return drug_name
