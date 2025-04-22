from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def read_root():
    """Return a simple greeting message."""
    return {"message": "Hello World"}
