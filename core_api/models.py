from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector # Importiamo il tipo di dato Vector
from core_api.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    
    # Relazione uno-a-molti: un documento ha molti frammenti
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    text = Column(Text, nullable=False)
    
    # Il vettore generato dall'AI. Supponiamo dimensione 4096 (es. Llama 3)
    embedding = Column(Vector(768)) 

    document = relationship("Document", back_populates="chunks")