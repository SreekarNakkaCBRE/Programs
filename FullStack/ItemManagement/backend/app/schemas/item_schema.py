from pydantic import BaseModel

class ItemBase(BaseModel):
    name: str
    description: str
    price: float

class ItemCreate(ItemBase):
    pass

class ItemModel(ItemBase):
    id: int

    class Config:
        from_attributes = True