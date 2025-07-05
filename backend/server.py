from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class SizeOption(BaseModel):
    size: str  # "Nhỏ (5g)", "Vừa (10g)", "Lớn (20g)"
    price: float
    original_price: Optional[float] = None
    stock: int = 0

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_en: str
    description: str
    description_en: str
    price: float  # Base price for display
    original_price: Optional[float] = None
    size_options: List[SizeOption] = []  # Different sizes with different prices
    image_url: str
    additional_images: List[str] = []  # Multiple product images
    category: str
    stock: int = 0
    featured: bool = False
    specifications: dict = {}  # Product specifications like origin, quality, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Cart Models
class CartItem(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    size: str  # Selected size
    size_price: float  # Price for selected size
    original_price: Optional[float] = None
    quantity: int = 1
    total_price: float = 0

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str  # For guest users
    items: List[CartItem] = []
    total_amount: float = 0
    total_items: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Order Models
class CustomerInfo(BaseModel):
    full_name: str
    phone: str
    email: str
    address: str
    city: str
    district: str
    ward: str
    notes: Optional[str] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    size: str
    size_price: float
    original_price: Optional[float] = None
    quantity: int
    total_price: float

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"KTH{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}")
    customer_info: CustomerInfo
    items: List[OrderItem]
    payment_method: str  # "cod" or "bank_transfer"
    payment_status: str = "pending"  # pending, paid, failed
    order_status: str = "pending"  # pending, confirmed, processing, shipping, delivered, cancelled
    subtotal: float
    shipping_fee: float = 0
    discount: float = 0
    total_amount: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    name_en: str
    description: str
    description_en: str
    price: float
    original_price: Optional[float] = None
    size_options: List[SizeOption] = []
    image_url: str
    additional_images: List[str] = []
    category: str
    stock: int = 0
    featured: bool = False
    specifications: dict = {}

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    size_options: Optional[List[SizeOption]] = None
    image_url: Optional[str] = None
    additional_images: Optional[List[str]] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None
    specifications: Optional[dict] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Khang Trầm Hương API"}

@api_router.get("/products", response_model=List[Product])
async def get_products(featured: Optional[bool] = None, category: Optional[str] = None):
    """Get all products with optional filtering"""
    query = {}
    if featured is not None:
        query["featured"] = featured
    if category:
        query["category"] = category
    
    products = await db.products.find(query).sort("created_at", -1).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    """Create a new product"""
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    """Update a product"""
    existing_product = await db.products.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize the database with sample products"""
    # Check if products already exist
    existing_products = await db.products.count_documents({})
    if existing_products == 0:
        # Create sample products
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "Trầm Hương Kỳ Nam Cao Cấp",
                "name_en": "Premium Kynam Agarwood",
                "description": "Trầm hương Kỳ Nam đặc biệt với hương thơm nồng nàn, quý hiếm. Sản phẩm cao cấp từ rừng tự nhiên với chất lượng vượt trội.",
                "description_en": "Premium Kynam Agarwood with intense fragrance, rare and precious. High-quality product from natural forests.",
                "price": 2500000,
                "original_price": 3000000,
                "size_options": [
                    {"size": "Nhỏ (5g)", "price": 1200000, "original_price": 1500000, "stock": 8},
                    {"size": "Vừa (10g)", "price": 2500000, "original_price": 3000000, "stock": 5},
                    {"size": "Lớn (20g)", "price": 4800000, "original_price": 5800000, "stock": 3}
                ],
                "image_url": "https://images.unsplash.com/photo-1613750255797-7d4f877615df",
                "additional_images": [
                    "https://images.unsplash.com/photo-1652719647182-094f5c442abc",
                    "https://images.unsplash.com/photo-1600122646819-75abc00c88a6",
                    "https://images.pexels.com/photos/14146722/pexels-photo-14146722.jpeg"
                ],
                "category": "Kỳ Nam",
                "stock": 16,
                "featured": True,
                "specifications": {
                    "origin": "Khánh Hòa, Việt Nam",
                    "age": "15-20 năm",
                    "oil_content": "Cao",
                    "fragrance_notes": "Ngọt, ấm, phức hợp",
                    "certification": "Chứng nhận tự nhiên"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Trầm Hương Tự Nhiên",
                "name_en": "Natural Agarwood",
                "description": "Trầm hương tự nhiên chất lượng cao, hương thơm tinh tế và bền lâu. Phù hợp cho thưởng thức hàng ngày và thiền định.",
                "description_en": "High-quality natural agarwood with delicate and long-lasting fragrance. Perfect for daily enjoyment and meditation.",
                "price": 800000,
                "original_price": 1000000,
                "size_options": [
                    {"size": "Nhỏ (5g)", "price": 400000, "original_price": 500000, "stock": 12},
                    {"size": "Vừa (10g)", "price": 800000, "original_price": 1000000, "stock": 10},
                    {"size": "Lớn (20g)", "price": 1500000, "original_price": 1900000, "stock": 6}
                ],
                "image_url": "https://images.unsplash.com/photo-1652719647182-094f5c442abc",
                "additional_images": [
                    "https://images.unsplash.com/photo-1613750255797-7d4f877615df",
                    "https://images.pexels.com/photos/14146722/pexels-photo-14146722.jpeg",
                    "https://images.unsplash.com/photo-1600122646819-75abc00c88a6"
                ],
                "category": "Tự Nhiên",
                "stock": 28,
                "featured": True,
                "specifications": {
                    "origin": "Quảng Nam, Việt Nam",
                    "age": "10-15 năm",
                    "oil_content": "Trung bình",
                    "fragrance_notes": "Ngọt nhẹ, thanh khiết",
                    "certification": "Chứng nhận nguồn gốc"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Trầm Hương Truyền Thống",
                "name_en": "Traditional Agarwood",
                "description": "Trầm hương theo phương pháp truyền thống, được chế biến cẩn thận với hương thơm đậm đà, mang đậm văn hóa Việt Nam.",
                "description_en": "Traditional agarwood processed with care, featuring rich and deep fragrance with Vietnamese cultural heritage.",
                "price": 1200000,
                "size_options": [
                    {"size": "Nhỏ (5g)", "price": 600000, "stock": 10},
                    {"size": "Vừa (10g)", "price": 1200000, "stock": 8},
                    {"size": "Lớn (20g)", "price": 2300000, "stock": 4}
                ],
                "image_url": "https://images.pexels.com/photos/14146722/pexels-photo-14146722.jpeg",
                "additional_images": [
                    "https://images.unsplash.com/photo-1652719647182-094f5c442abc",
                    "https://images.unsplash.com/photo-1613750255797-7d4f877615df"
                ],
                "category": "Truyền Thống",
                "stock": 22,
                "featured": False,
                "specifications": {
                    "origin": "Gia Lai, Việt Nam",
                    "age": "8-12 năm",
                    "oil_content": "Trung bình cao",
                    "fragrance_notes": "Đậm đà, truyền thống",
                    "processing": "Phương pháp cổ truyền"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Trầm Hương Sáng",
                "name_en": "Light Agarwood",
                "description": "Trầm hương sáng với hương thơm nhẹ nhàng, thanh thoát. Lý tưởng cho không gian yên tĩnh và thư giãn.",
                "description_en": "Light agarwood with gentle, pure fragrance. Ideal for peaceful spaces and relaxation.",
                "price": 600000,
                "size_options": [
                    {"size": "Nhỏ (5g)", "price": 300000, "stock": 15},
                    {"size": "Vừa (10g)", "price": 600000, "stock": 15},
                    {"size": "Lớn (20g)", "price": 1100000, "stock": 8}
                ],
                "image_url": "https://images.unsplash.com/photo-1600122646819-75abc00c88a6",
                "additional_images": [
                    "https://images.pexels.com/photos/14146722/pexels-photo-14146722.jpeg",
                    "https://images.unsplash.com/photo-1613750255797-7d4f877615df"
                ],
                "category": "Sáng",
                "stock": 38,
                "featured": True,
                "specifications": {
                    "origin": "Đắk Lắk, Việt Nam",
                    "age": "5-8 năm",
                    "oil_content": "Nhẹ",
                    "fragrance_notes": "Nhẹ nhàng, tinh khiết",
                    "usage": "Thư giãn, thiền định"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        await db.products.insert_many(sample_products)
        logger.info("Sample products inserted successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()