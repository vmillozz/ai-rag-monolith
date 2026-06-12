from pydantic import BaseModel
from typing import List

class ChunkResponse(BaseModel):
    id: int
    text: str

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    filename: str
    
    class Config:
        from_attributes = True

class QueryRequest(BaseModel):
    question: str