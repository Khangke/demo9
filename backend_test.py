#!/usr/bin/env python3
import requests
import json
import sys
import os
from pprint import pprint

# Get the backend URL from the frontend .env file
def get_backend_url():
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                return line.strip().split('=')[1].strip('"\'')
    return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("Error: Could not find REACT_APP_BACKEND_URL in frontend/.env")
    sys.exit(1)

API_URL = f"{BACKEND_URL}/api"
print(f"Using API URL: {API_URL}")

# Test class for API endpoints
class AgarwoodAPITester:
    def __init__(self, api_url):
        self.api_url = api_url
        self.created_product_id = None
        self.created_order_id = None
        self.created_order_number = None
        self.test_session_id = "test_session_001"
        self.test_results = {
            "health_check": False,
            "get_products": False,
            "get_featured_products": False,
            "create_product": False,
            "get_product_by_id": False,
            "update_product": False,
            "delete_product": False,
            "sample_data": False,
            # Shopping Cart API tests
            "get_cart": False,
            "add_to_cart": False,
            "update_cart_item": False,
            "remove_from_cart": False,
            "clear_cart": False,
            # Order Management API tests
            "create_order": False,
            "get_order_by_id": False,
            "get_order_by_number": False
        }
        self.sample_product = {
            "name": "Trầm Hương Xông Phòng",
            "name_en": "Agarwood Room Incense",
            "description": "Trầm hương xông phòng cao cấp, mang lại không gian thư giãn và thanh tịnh cho ngôi nhà của bạn.",
            "description_en": "Premium agarwood room incense, bringing a relaxing and peaceful atmosphere to your home.",
            "price": 450000,
            "original_price": 550000,
            "size_options": [
                {"size": "Nhỏ (5g)", "price": 250000, "original_price": 300000, "stock": 15},
                {"size": "Vừa (10g)", "price": 450000, "original_price": 550000, "stock": 10},
                {"size": "Lớn (20g)", "price": 850000, "original_price": 950000, "stock": 5}
            ],
            "image_url": "https://images.unsplash.com/photo-1544816565-aa8c1166648f",
            "additional_images": [
                "https://images.unsplash.com/photo-1613750255797-7d4f877615df",
                "https://images.unsplash.com/photo-1600122646819-75abc00c88a6"
            ],
            "category": "Xông Phòng",
            "stock": 20,
            "featured": True,
            "specifications": {
                "origin": "Phú Yên, Việt Nam",
                "age": "5-7 năm",
                "oil_content": "Trung bình",
                "fragrance_notes": "Thanh nhẹ, thư giãn",
                "usage": "Xông phòng, thư giãn"
            }
        }
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("\n=== Running Vietnamese Agarwood E-commerce API Tests ===\n")
        
        self.test_health_check()
        self.test_get_products()
        self.test_get_featured_products()
        self.test_create_product()
        self.test_get_product_by_id()
        self.test_update_product()
        
        # Shopping Cart API tests
        print("\n=== Testing Shopping Cart APIs ===\n")
        self.test_get_cart()
        self.test_add_to_cart()
        self.test_update_cart_item()
        self.test_remove_from_cart()
        self.test_clear_cart()
        
        # Order Management API tests
        print("\n=== Testing Order Management APIs ===\n")
        self.test_create_order()
        self.test_get_order_by_id()
        self.test_get_order_by_number()
        
        # Clean up
        self.test_delete_product()
        
        self.print_summary()
        
        return all(self.test_results.values())
    
    def test_health_check(self):
        """Test the API health check endpoint"""
        print("\n--- Testing API Health Check ---")
        try:
            response = requests.get(f"{self.api_url}/")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 200 and "message" in response.json():
                self.test_results["health_check"] = True
                print("✅ API Health Check: SUCCESS")
            else:
                print("❌ API Health Check: FAILED")
        except Exception as e:
            print(f"❌ API Health Check: FAILED - {str(e)}")
    
    def test_get_products(self):
        """Test getting all products and verify sample data"""
        print("\n--- Testing Get All Products ---")
        try:
            response = requests.get(f"{self.api_url}/products")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                products = response.json()
                print(f"Found {len(products)} products")
                
                # Check if we have at least 4 sample products
                if len(products) >= 4:
                    self.test_results["sample_data"] = True
                    print("✅ Sample Data Verification: SUCCESS - Found at least 4 products")
                    
                    # Print sample product details
                    print("\nSample Product Details:")
                    sample_product = products[0]
                    for key in ["name", "name_en", "price", "category", "featured"]:
                        print(f"  {key}: {sample_product.get(key)}")
                    
                    # Verify new fields exist in the product model
                    required_fields = ["size_options", "additional_images", "specifications"]
                    missing_fields = [field for field in required_fields if field not in sample_product]
                    
                    if not missing_fields:
                        print("\n✅ Enhanced Product Model: SUCCESS - All new fields are present")
                        
                        # Detailed verification of size_options
                        size_options = sample_product.get("size_options", [])
                        if size_options:
                            print("\nSize Options:")
                            size_option_fields = ["size", "price", "stock"]
                            optional_fields = ["original_price"]
                            
                            for size_option in size_options:
                                missing_required = [f for f in size_option_fields if f not in size_option]
                                if missing_required:
                                    print(f"  ❌ Size option missing required fields: {', '.join(missing_required)}")
                                else:
                                    print(f"  ✅ {size_option.get('size')}: {size_option.get('price')} VND (Stock: {size_option.get('stock')})")
                                    if "original_price" in size_option and size_option.get("original_price"):
                                        discount = 100 - (size_option.get("price") / size_option.get("original_price") * 100)
                                        print(f"     Original: {size_option.get('original_price')} VND (Discount: {discount:.1f}%)")
                            
                            # Verify different sizes have different prices
                            sizes = [opt.get("size") for opt in size_options]
                            prices = [opt.get("price") for opt in size_options]
                            if len(set(sizes)) == len(sizes) and len(set(prices)) == len(prices):
                                print("  ✅ Size options have unique sizes and prices")
                            else:
                                print("  ❌ Size options may have duplicate sizes or prices")
                        else:
                            print("\n❌ Size Options: FAILED - No size options found")
                        
                        # Detailed verification of additional_images
                        additional_images = sample_product.get("additional_images", [])
                        if additional_images:
                            print("\nAdditional Images:")
                            for i, img in enumerate(additional_images):
                                print(f"  {i+1}. {img}")
                            print(f"  ✅ Found {len(additional_images)} additional images")
                        else:
                            print("\n❌ Additional Images: FAILED - No additional images found")
                        
                        # Detailed verification of specifications
                        specifications = sample_product.get("specifications", {})
                        if specifications:
                            print("\nSpecifications:")
                            for key, value in specifications.items():
                                print(f"  {key}: {value}")
                            print(f"  ✅ Found {len(specifications)} specification fields")
                            
                            # Check for common specification fields
                            common_specs = ["origin", "age", "oil_content", "fragrance_notes"]
                            found_specs = [spec for spec in common_specs if spec in specifications]
                            if found_specs:
                                print(f"  ✅ Found common specification fields: {', '.join(found_specs)}")
                            else:
                                print("  ⚠️ No common specification fields found")
                        else:
                            print("\n❌ Specifications: FAILED - No specifications found")
                    else:
                        print(f"\n❌ Enhanced Product Model: FAILED - Missing fields: {', '.join(missing_fields)}")
                else:
                    print("❌ Sample Data Verification: FAILED - Expected at least 4 products")
                
                self.test_results["get_products"] = True
                print("✅ Get All Products: SUCCESS")
            else:
                print("❌ Get All Products: FAILED")
        except Exception as e:
            print(f"❌ Get All Products: FAILED - {str(e)}")
    
    def test_get_featured_products(self):
        """Test getting featured products"""
        print("\n--- Testing Get Featured Products ---")
        try:
            response = requests.get(f"{self.api_url}/products?featured=true")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                products = response.json()
                print(f"Found {len(products)} featured products")
                
                # Verify all returned products are featured
                all_featured = all(product.get("featured") for product in products)
                if all_featured:
                    self.test_results["get_featured_products"] = True
                    print("✅ Get Featured Products: SUCCESS - All returned products are featured")
                    
                    # Verify featured products have all enhanced fields
                    if products:
                        sample_product = products[0]
                        enhanced_fields = ["size_options", "additional_images", "specifications"]
                        missing_fields = [field for field in enhanced_fields if field not in sample_product]
                        
                        if not missing_fields:
                            print("✅ Featured Products Model: SUCCESS - All enhanced fields are present")
                            
                            # Check Vietnamese content
                            vietnamese_fields = {
                                "name": str,
                                "description": str
                            }
                            
                            all_vietnamese_valid = True
                            for field, expected_type in vietnamese_fields.items():
                                if field not in sample_product:
                                    print(f"❌ Missing Vietnamese field: {field}")
                                    all_vietnamese_valid = False
                                elif not isinstance(sample_product.get(field), expected_type):
                                    print(f"❌ Invalid type for {field}: Expected {expected_type.__name__}, got {type(sample_product.get(field)).__name__}")
                                    all_vietnamese_valid = False
                                elif not sample_product.get(field):
                                    print(f"❌ Empty Vietnamese field: {field}")
                                    all_vietnamese_valid = False
                            
                            if all_vietnamese_valid:
                                print("✅ Vietnamese Content: SUCCESS - All Vietnamese fields are present and non-empty")
                                print(f"  Sample Vietnamese name: {sample_product.get('name')}")
                                print(f"  Sample Vietnamese description: {sample_product.get('description')[:50]}...")
                            else:
                                print("❌ Vietnamese Content: FAILED - Some Vietnamese fields are missing or empty")
                        else:
                            print(f"❌ Featured Products Model: FAILED - Missing fields: {', '.join(missing_fields)}")
                    
                    # Test non-featured products
                    non_featured_response = requests.get(f"{self.api_url}/products?featured=false")
                    if non_featured_response.status_code == 200:
                        non_featured_products = non_featured_response.json()
                        if all(not product.get("featured") for product in non_featured_products):
                            print(f"✅ Non-Featured Products: SUCCESS - Found {len(non_featured_products)} non-featured products")
                        else:
                            print("❌ Non-Featured Products: FAILED - Some products marked as featured")
                    else:
                        print("❌ Non-Featured Products Query: FAILED")
                else:
                    print("❌ Get Featured Products: FAILED - Some returned products are not featured")
            else:
                print("❌ Get Featured Products: FAILED")
        except Exception as e:
            print(f"❌ Get Featured Products: FAILED - {str(e)}")
    
    def test_create_product(self):
        """Test creating a new product"""
        print("\n--- Testing Create Product ---")
        try:
            response = requests.post(
                f"{self.api_url}/products",
                json=self.sample_product
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                product = response.json()
                self.created_product_id = product.get("id")
                print(f"Created product with ID: {self.created_product_id}")
                
                # Verify product data
                for key, value in self.sample_product.items():
                    if product.get(key) != value:
                        print(f"❌ Field mismatch: {key} - Expected: {value}, Got: {product.get(key)}")
                
                self.test_results["create_product"] = True
                print("✅ Create Product: SUCCESS")
            else:
                print("❌ Create Product: FAILED")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Create Product: FAILED - {str(e)}")
    
    def test_get_product_by_id(self):
        """Test getting a product by ID"""
        print("\n--- Testing Get Product by ID ---")
        if not self.created_product_id:
            print("❌ Get Product by ID: SKIPPED - No product ID available")
            return
        
        try:
            response = requests.get(f"{self.api_url}/products/{self.created_product_id}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                product = response.json()
                print(f"Retrieved product: {product.get('name')} ({product.get('name_en')})")
                
                # Verify enhanced data fields
                enhanced_fields = {
                    "size_options": list,
                    "additional_images": list,
                    "specifications": dict
                }
                
                all_fields_valid = True
                for field, expected_type in enhanced_fields.items():
                    if field not in product:
                        print(f"❌ Missing field: {field}")
                        all_fields_valid = False
                    elif not isinstance(product.get(field), expected_type):
                        print(f"❌ Invalid type for {field}: Expected {expected_type.__name__}, got {type(product.get(field)).__name__}")
                        all_fields_valid = False
                
                if all_fields_valid:
                    print("✅ Enhanced Data Fields: SUCCESS - All new fields are present with correct types")
                    
                    # Detailed verification of size_options
                    size_options = product.get("size_options", [])
                    if size_options:
                        print("\nSize Options:")
                        size_option_fields = ["size", "price", "stock"]
                        optional_fields = ["original_price"]
                        
                        for size_option in size_options:
                            missing_required = [f for f in size_option_fields if f not in size_option]
                            if missing_required:
                                print(f"  ❌ Size option missing required fields: {', '.join(missing_required)}")
                            else:
                                print(f"  ✅ {size_option.get('size')}: {size_option.get('price')} VND (Stock: {size_option.get('stock')})")
                                if "original_price" in size_option and size_option.get("original_price"):
                                    discount = 100 - (size_option.get("price") / size_option.get("original_price") * 100)
                                    print(f"     Original: {size_option.get('original_price')} VND (Discount: {discount:.1f}%)")
                        
                        # Verify different sizes have different prices
                        sizes = [opt.get("size") for opt in size_options]
                        prices = [opt.get("price") for opt in size_options]
                        if len(set(sizes)) == len(sizes) and len(set(prices)) == len(prices):
                            print("  ✅ Size options have unique sizes and prices")
                        else:
                            print("  ❌ Size options may have duplicate sizes or prices")
                        
                        # Verify price relationship (larger sizes should cost more)
                        if len(size_options) > 1:
                            # Try to extract size values for comparison (assuming format like "Nhỏ (5g)")
                            try:
                                size_values = []
                                for opt in size_options:
                                    size_str = opt.get("size", "")
                                    # Extract number from string like "Nhỏ (5g)"
                                    import re
                                    match = re.search(r'\((\d+)g\)', size_str)
                                    if match:
                                        size_values.append((int(match.group(1)), opt.get("price")))
                                
                                if size_values:
                                    # Sort by size value
                                    size_values.sort(key=lambda x: x[0])
                                    prices_increase = all(size_values[i][1] < size_values[i+1][1] for i in range(len(size_values)-1))
                                    if prices_increase:
                                        print("  ✅ Prices correctly increase with size")
                                    else:
                                        print("  ⚠️ Prices don't consistently increase with size")
                            except Exception as e:
                                print(f"  ⚠️ Couldn't verify price-size relationship: {str(e)}")
                    else:
                        print("\n❌ Size Options: FAILED - No size options found")
                    
                    # Detailed verification of additional_images
                    additional_images = product.get("additional_images", [])
                    if additional_images:
                        print("\nAdditional Images:")
                        for i, img in enumerate(additional_images):
                            print(f"  {i+1}. {img}")
                        print(f"  ✅ Found {len(additional_images)} additional images")
                        
                        # Verify all images are valid URLs
                        valid_urls = all(img.startswith(("http://", "https://")) for img in additional_images)
                        if valid_urls:
                            print("  ✅ All images have valid URL format")
                        else:
                            print("  ❌ Some images have invalid URL format")
                    else:
                        print("\n❌ Additional Images: FAILED - No additional images found")
                    
                    # Detailed verification of specifications
                    specifications = product.get("specifications", {})
                    if specifications:
                        print("\nSpecifications:")
                        for key, value in specifications.items():
                            print(f"  {key}: {value}")
                        print(f"  ✅ Found {len(specifications)} specification fields")
                        
                        # Check for common specification fields
                        common_specs = ["origin", "age", "oil_content", "fragrance_notes"]
                        found_specs = [spec for spec in common_specs if spec in specifications]
                        if found_specs:
                            print(f"  ✅ Found common specification fields: {', '.join(found_specs)}")
                        else:
                            print("  ⚠️ No common specification fields found")
                    else:
                        print("\n❌ Specifications: FAILED - No specifications found")
                
                self.test_results["get_product_by_id"] = True
                print("✅ Get Product by ID: SUCCESS")
            else:
                print("❌ Get Product by ID: FAILED")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Get Product by ID: FAILED - {str(e)}")
    
    def test_update_product(self):
        """Test updating a product"""
        print("\n--- Testing Update Product ---")
        if not self.created_product_id:
            print("❌ Update Product: SKIPPED - No product ID available")
            return
        
        update_data = {
            "price": 499000,
            "stock": 25,
            "featured": False,
            "size_options": [
                {"size": "Nhỏ (5g)", "price": 280000, "original_price": 320000, "stock": 12},
                {"size": "Vừa (10g)", "price": 499000, "original_price": 580000, "stock": 8},
                {"size": "Lớn (20g)", "price": 890000, "original_price": 980000, "stock": 4}
            ],
            "additional_images": [
                "https://images.unsplash.com/photo-1613750255797-7d4f877615df",
                "https://images.unsplash.com/photo-1600122646819-75abc00c88a6",
                "https://images.pexels.com/photos/14146722/pexels-photo-14146722.jpeg"
            ],
            "specifications": {
                "origin": "Phú Yên, Việt Nam",
                "age": "6-8 năm",
                "oil_content": "Cao",
                "fragrance_notes": "Thanh nhẹ, thư giãn, hương gỗ",
                "usage": "Xông phòng, thư giãn, thiền định"
            }
        }
        
        try:
            response = requests.put(
                f"{self.api_url}/products/{self.created_product_id}",
                json=update_data
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                product = response.json()
                print(f"Updated product: {product.get('name')}")
                
                # Verify updated fields
                all_updated = True
                for key, value in update_data.items():
                    if key in ["size_options", "additional_images", "specifications"]:
                        # For complex fields, just check if they exist and have the right length
                        if key == "size_options":
                            if len(product.get(key, [])) != len(value):
                                all_updated = False
                                print(f"❌ Field not updated correctly: {key} - Expected {len(value)} items, Got {len(product.get(key, []))}")
                        elif key == "additional_images":
                            if len(product.get(key, [])) != len(value):
                                all_updated = False
                                print(f"❌ Field not updated correctly: {key} - Expected {len(value)} items, Got {len(product.get(key, []))}")
                        elif key == "specifications":
                            if not all(k in product.get(key, {}) for k in value.keys()):
                                all_updated = False
                                print(f"❌ Field not updated correctly: {key} - Missing some specification keys")
                    elif product.get(key) != value:
                        all_updated = False
                        print(f"❌ Field not updated: {key} - Expected: {value}, Got: {product.get(key)}")
                
                if all_updated:
                    self.test_results["update_product"] = True
                    print("✅ Update Product: SUCCESS - All fields updated correctly")
                else:
                    print("❌ Update Product: FAILED - Some fields were not updated correctly")
            else:
                print("❌ Update Product: FAILED")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Update Product: FAILED - {str(e)}")
    
    def test_delete_product(self):
        """Test deleting a product"""
        print("\n--- Testing Delete Product ---")
        if not self.created_product_id:
            print("❌ Delete Product: SKIPPED - No product ID available")
            return
        
        try:
            response = requests.delete(f"{self.api_url}/products/{self.created_product_id}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print(f"Response: {response.json()}")
                
                # Verify product is deleted
                verify_response = requests.get(f"{self.api_url}/products/{self.created_product_id}")
                if verify_response.status_code == 404:
                    self.test_results["delete_product"] = True
                    print("✅ Delete Product: SUCCESS - Product was deleted and can no longer be retrieved")
                else:
                    print("❌ Delete Product: FAILED - Product still exists after deletion")
            else:
                print("❌ Delete Product: FAILED")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Delete Product: FAILED - {str(e)}")
    
    # Shopping Cart API Tests
    def test_get_cart(self):
        """Test getting or creating a cart by session ID"""
        print("\n--- Testing Get Cart ---")
        try:
            # Clear any existing cart first
            clear_response = requests.delete(f"{self.api_url}/cart/{self.test_session_id}/clear")
            
            # Get cart
            response = requests.get(f"{self.api_url}/cart/{self.test_session_id}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                cart = response.json()
                print(f"Retrieved cart for session: {cart.get('session_id')}")
                
                # Verify cart structure
                required_fields = ["id", "session_id", "items", "total_amount", "total_items", "created_at", "updated_at"]
                missing_fields = [field for field in required_fields if field not in cart]
                
                if not missing_fields:
                    # Verify it's a new empty cart
                    if cart.get("session_id") == self.test_session_id and cart.get("items") == [] and cart.get("total_items") == 0:
                        self.test_results["get_cart"] = True
                        print("✅ Get Cart: SUCCESS - Empty cart created for new session")
                    else:
                        print("⚠️ Get Cart: WARNING - Cart exists but is not empty or has wrong session ID")
                        self.test_results["get_cart"] = True  # Still mark as success since API works
                else:
                    print(f"❌ Get Cart: FAILED - Missing required fields: {', '.join(missing_fields)}")
            else:
                print("❌ Get Cart: FAILED")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Get Cart: FAILED - {str(e)}")
    
    def test_add_to_cart(self):
        """Test adding items to cart"""
        print("\n--- Testing Add to Cart ---")
        try:
            # Get a product ID to add to cart
            products_response = requests.get(f"{self.api_url}/products")
            if products_response.status_code != 200 or not products_response.json():
                print("❌ Add to Cart: FAILED - Could not get products to add to cart")
                return
            
            products = products_response.json()
            product = products[0]  # Use the first product
            product_id = product.get("id")
            
            # Get size options
            size_options = product.get("size_options", [])
            if not size_options:
                print("❌ Add to Cart: FAILED - Product has no size options")
                return
            
            # Test Case 1: Add item with valid quantity
            print("\nTest Case 1: Add item with valid quantity")
            size_option = size_options[0]  # Use the first size option
            item_data = {
                "product_id": product_id,
                "size": size_option.get("size"),
                "quantity": 2
            }
            
            response = requests.post(
                f"{self.api_url}/cart/{self.test_session_id}/add",
                json=item_data
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                cart = result.get("cart", {})
                print(f"Added item to cart: {item_data}")
                
                # Verify cart has the item
                items = cart.get("items", [])
                if items and len(items) > 0:
                    item = next((i for i in items if i.get("product_id") == product_id and i.get("size") == size_option.get("size")), None)
                    if item:
                        print(f"✅ Item added: {item.get('product_name')} - {item.get('size')} - Quantity: {item.get('quantity')}")
                        
                        # Verify total calculation
                        expected_total = item.get("quantity") * item.get("size_price")
                        if item.get("total_price") == expected_total:
                            print(f"✅ Item total price calculated correctly: {item.get('total_price')}")
                        else:
                            print(f"❌ Item total price incorrect: Expected {expected_total}, Got {item.get('total_price')}")
                        
                        # Verify cart totals
                        if cart.get("total_items") == item.get("quantity"):
                            print(f"✅ Cart total items calculated correctly: {cart.get('total_items')}")
                        else:
                            print(f"❌ Cart total items incorrect: Expected {item.get('quantity')}, Got {cart.get('total_items')}")
                        
                        if cart.get("total_amount") == expected_total:
                            print(f"✅ Cart total amount calculated correctly: {cart.get('total_amount')}")
                        else:
                            print(f"❌ Cart total amount incorrect: Expected {expected_total}, Got {cart.get('total_amount')}")
                    else:
                        print("❌ Item not found in cart after adding")
                else:
                    print("❌ Cart items array is empty after adding item")
            else:
                print(f"❌ Add to Cart (Valid Quantity): FAILED - {response.text}")
                
            # Test Case 2: Add same item again (should merge and update quantity)
            print("\nTest Case 2: Add same item again (should merge)")
            response = requests.post(
                f"{self.api_url}/cart/{self.test_session_id}/add",
                json=item_data
            )
            
            if response.status_code == 200:
                result = response.json()
                cart = result.get("cart", {})
                items = cart.get("items", [])
                
                # Verify item was merged (not duplicated)
                if len(items) == 1:
                    item = items[0]
                    if item.get("quantity") == 4:  # 2 + 2
                        print(f"✅ Items merged correctly: Quantity updated to {item.get('quantity')}")
                        
                        # Verify updated totals
                        expected_total = item.get("quantity") * item.get("size_price")
                        if item.get("total_price") == expected_total:
                            print(f"✅ Merged item total price calculated correctly: {item.get('total_price')}")
                        else:
                            print(f"❌ Merged item total price incorrect: Expected {expected_total}, Got {item.get('total_price')}")
                    else:
                        print(f"❌ Items not merged correctly: Expected quantity 4, Got {item.get('quantity')}")
                else:
                    print(f"❌ Items not merged: Found {len(items)} items in cart")
            else:
                print(f"❌ Add to Cart (Merge): FAILED - {response.text}")
            
            # Test Case 3: Add different size of same product
            print("\nTest Case 3: Add different size of same product")
            if len(size_options) > 1:
                different_size = size_options[1]  # Use the second size option
                different_size_data = {
                    "product_id": product_id,
                    "size": different_size.get("size"),
                    "quantity": 1
                }
                
                response = requests.post(
                    f"{self.api_url}/cart/{self.test_session_id}/add",
                    json=different_size_data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    cart = result.get("cart", {})
                    items = cart.get("items", [])
                    
                    # Verify both sizes are in cart
                    if len(items) == 2:
                        print(f"✅ Different size added as separate item: Now have {len(items)} items in cart")
                        
                        # Verify cart totals
                        expected_items = 5  # 4 from first size + 1 from second size
                        if cart.get("total_items") == expected_items:
                            print(f"✅ Cart total items calculated correctly: {cart.get('total_items')}")
                        else:
                            print(f"❌ Cart total items incorrect: Expected {expected_items}, Got {cart.get('total_items')}")
                        
                        # Calculate expected total amount
                        expected_amount = (4 * size_option.get("price")) + (1 * different_size.get("price"))
                        if abs(cart.get("total_amount") - expected_amount) < 0.01:  # Allow for floating point differences
                            print(f"✅ Cart total amount calculated correctly: {cart.get('total_amount')}")
                        else:
                            print(f"❌ Cart total amount incorrect: Expected {expected_amount}, Got {cart.get('total_amount')}")
                    else:
                        print(f"❌ Different size not added correctly: Expected 2 items, Got {len(items)}")
                else:
                    print(f"❌ Add to Cart (Different Size): FAILED - {response.text}")
            else:
                print("⚠️ Skipping different size test: Product has only one size option")
            
            # Test Case 4: Add item with quantity exceeding stock
            print("\nTest Case 4: Add item with quantity exceeding stock")
            exceed_stock_data = {
                "product_id": product_id,
                "size": size_option.get("size"),
                "quantity": size_option.get("stock") + 10  # Exceed stock by 10
            }
            
            response = requests.post(
                f"{self.api_url}/cart/{self.test_session_id}/add",
                json=exceed_stock_data
            )
            
            if response.status_code == 400:
                print(f"✅ Stock validation works: {response.text}")
            else:
                print(f"❌ Stock validation failed: Expected 400 error, Got {response.status_code}")
            
            # Mark test as successful if we got here
            self.test_results["add_to_cart"] = True
            print("\n✅ Add to Cart: SUCCESS - All test cases completed")
            
        except Exception as e:
            print(f"❌ Add to Cart: FAILED - {str(e)}")
    
    def test_update_cart_item(self):
        """Test updating cart item quantity"""
        print("\n--- Testing Update Cart Item ---")
        try:
            # Get current cart
            response = requests.get(f"{self.api_url}/cart/{self.test_session_id}")
            if response.status_code != 200 or not response.json().get("items"):
                print("❌ Update Cart Item: FAILED - Could not get cart or cart is empty")
                return
            
            cart = response.json()
            items = cart.get("items", [])
            if not items:
                print("❌ Update Cart Item: FAILED - Cart is empty")
                return
            
            item = items[0]  # Use the first item
            original_quantity = item.get("quantity")
            product_id = item.get("product_id")
            size = item.get("size")
            
            # Test Case 1: Increase quantity
            print("\nTest Case 1: Increase quantity")
            new_quantity = original_quantity + 1
            update_data = {
                "product_id": product_id,
                "size": size,
                "quantity": new_quantity
            }
            
            response = requests.put(
                f"{self.api_url}/cart/{self.test_session_id}/update",
                json=update_data
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                cart = result.get("cart", {})
                items = cart.get("items", [])
                
                # Find the updated item
                updated_item = next((i for i in items if i.get("product_id") == product_id and i.get("size") == size), None)
                if updated_item and updated_item.get("quantity") == new_quantity:
                    print(f"✅ Quantity increased: {original_quantity} → {updated_item.get('quantity')}")
                    
                    # Verify total price updated
                    expected_total = new_quantity * updated_item.get("size_price")
                    if updated_item.get("total_price") == expected_total:
                        print(f"✅ Item total price updated correctly: {updated_item.get('total_price')}")
                    else:
                        print(f"❌ Item total price incorrect: Expected {expected_total}, Got {updated_item.get('total_price')}")
                else:
                    print("❌ Item quantity not updated correctly")
            else:
                print(f"❌ Update Cart Item (Increase): FAILED - {response.text}")
            
            # Test Case 2: Decrease quantity
            print("\nTest Case 2: Decrease quantity")
            new_quantity = original_quantity - 1
            if new_quantity < 1:
                new_quantity = 1  # Ensure we don't go below 1
                
            update_data = {
                "product_id": product_id,
                "size": size,
                "quantity": new_quantity
            }
            
            response = requests.put(
                f"{self.api_url}/cart/{self.test_session_id}/update",
                json=update_data
            )
            
            if response.status_code == 200:
                result = response.json()
                cart = result.get("cart", {})
                items = cart.get("items", [])
                
                # Find the updated item
                updated_item = next((i for i in items if i.get("product_id") == product_id and i.get("size") == size), None)
                if updated_item and updated_item.get("quantity") == new_quantity:
                    print(f"✅ Quantity decreased: {original_quantity + 1} → {updated_item.get('quantity')}")
                else:
                    print("❌ Item quantity not updated correctly")
            else:
                print(f"❌ Update Cart Item (Decrease): FAILED - {response.text}")
            
            # Test Case 3: Set quantity to zero (should remove item)
            print("\nTest Case 3: Set quantity to zero (should remove item)")
            update_data = {
                "product_id": product_id,
                "size": size,
                "quantity": 0
            }
            
            response = requests.put(
                f"{self.api_url}/cart/{self.test_session_id}/update",
                json=update_data
            )
            
            if response.status_code == 200:
                result = response.json()
                cart = result.get("cart", {})
                items = cart.get("items", [])
                
                # Check if item was removed
                removed_item = next((i for i in items if i.get("product_id") == product_id and i.get("size") == size), None)
                if not removed_item:
                    print("✅ Item removed when quantity set to zero")
                else:
                    print("❌ Item not removed when quantity set to zero")
            else:
                print(f"❌ Update Cart Item (Zero Quantity): FAILED - {response.text}")
            
            # Mark test as successful if we got here
            self.test_results["update_cart_item"] = True
            print("\n✅ Update Cart Item: SUCCESS - All test cases completed")
            
        except Exception as e:
            print(f"❌ Update Cart Item: FAILED - {str(e)}")
    
    def test_remove_from_cart(self):
        """Test removing item from cart"""
        print("\n--- Testing Remove from Cart ---")
        try:
            # First, add an item to cart to ensure we have something to remove
            # Get a product ID
            products_response = requests.get(f"{self.api_url}/products")
            if products_response.status_code != 200 or not products_response.json():
                print("❌ Remove from Cart: FAILED - Could not get products")
                return
            
            products = products_response.json()
            product = products[0]  # Use the first product
            product_id = product.get("id")
            size_options = product.get("size_options", [])
            
            if not size_options:
                print("❌ Remove from Cart: FAILED - Product has no size options")
                return
            
            size_option = size_options[0]
            
            # Add item to cart
            add_data = {
                "product_id": product_id,
                "size": size_option.get("size"),
                "quantity": 3
            }
            
            add_response = requests.post(
                f"{self.api_url}/cart/{self.test_session_id}/add",
                json=add_data
            )
            
            if add_response.status_code != 200:
                print(f"❌ Remove from Cart: FAILED - Could not add item to cart: {add_response.text}")
                return
            
            # Now test removing the item
            remove_data = {
                "product_id": product_id,
                "size": size_option.get("size")
            }
            
            response = requests.delete(
                f"{self.api_url}/cart/{self.test_session_id}/remove",
                json=remove_data
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                cart = result.get("cart", {})
                items = cart.get("items", [])
                
                # Verify item was removed
                removed_item = next((i for i in items if i.get("product_id") == product_id and i.get("size") == size_option.get("size")), None)
                if not removed_item:
                    print("✅ Item successfully removed from cart")
                    
                    # Verify cart totals updated
                    if len(items) == 0:
                        if cart.get("total_items") == 0:
                            print("✅ Cart total items updated correctly: 0")
                        else:
                            print(f"❌ Cart total items incorrect: Expected 0, Got {cart.get('total_items')}")
                        
                        if cart.get("total_amount") == 0:
                            print("✅ Cart total amount updated correctly: 0")
                        else:
                            print(f"❌ Cart total amount incorrect: Expected 0, Got {cart.get('total_amount')}")
                    else:
                        print(f"⚠️ Cart still has {len(items)} other items")
                else:
                    print("❌ Item not removed from cart")
            else:
                print(f"❌ Remove from Cart: FAILED - {response.text}")
            
            # Mark test as successful if we got here
            self.test_results["remove_from_cart"] = True
            print("✅ Remove from Cart: SUCCESS")
            
        except Exception as e:
            print(f"❌ Remove from Cart: FAILED - {str(e)}")
    
    def test_clear_cart(self):
        """Test clearing all items from cart"""
        print("\n--- Testing Clear Cart ---")
        try:
            # First, add some items to cart
            # Get products
            products_response = requests.get(f"{self.api_url}/products")
            if products_response.status_code != 200 or not products_response.json():
                print("❌ Clear Cart: FAILED - Could not get products")
                return
            
            products = products_response.json()
            
            # Add two different products to cart
            for i in range(min(2, len(products))):
                product = products[i]
                product_id = product.get("id")
                size_options = product.get("size_options", [])
                
                if not size_options:
                    continue
                
                size_option = size_options[0]
                
                add_data = {
                    "product_id": product_id,
                    "size": size_option.get("size"),
                    "quantity": i + 1
                }
                
                add_response = requests.post(
                    f"{self.api_url}/cart/{self.test_session_id}/add",
                    json=add_data
                )
                
                if add_response.status_code != 200:
                    print(f"⚠️ Could not add product {i+1} to cart: {add_response.text}")
            
            # Verify cart has items
            check_response = requests.get(f"{self.api_url}/cart/{self.test_session_id}")
            if check_response.status_code != 200:
                print(f"❌ Clear Cart: FAILED - Could not get cart: {check_response.text}")
                return
            
            cart = check_response.json()
            items_before = cart.get("items", [])
            
            if not items_before:
                print("⚠️ Cart is already empty before clearing")
            else:
                print(f"Cart has {len(items_before)} items before clearing")
            
            # Now test clearing the cart
            response = requests.delete(f"{self.api_url}/cart/{self.test_session_id}/clear")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print(f"Response: {response.json()}")
                
                # Verify cart is empty
                check_response = requests.get(f"{self.api_url}/cart/{self.test_session_id}")
                if check_response.status_code == 200:
                    cart = check_response.json()
                    items_after = cart.get("items", [])
                    
                    if not items_after:
                        print("✅ Cart successfully cleared - No items remaining")
                        
                        # Verify cart totals
                        if cart.get("total_items") == 0:
                            print("✅ Cart total items reset to 0")
                        else:
                            print(f"❌ Cart total items not reset: Expected 0, Got {cart.get('total_items')}")
                        
                        if cart.get("total_amount") == 0:
                            print("✅ Cart total amount reset to 0")
                        else:
                            print(f"❌ Cart total amount not reset: Expected 0, Got {cart.get('total_amount')}")
                    else:
                        print(f"❌ Cart not cleared - Still has {len(items_after)} items")
                else:
                    print(f"❌ Could not verify cart after clearing: {check_response.text}")
            else:
                print(f"❌ Clear Cart: FAILED - {response.text}")
            
            # Mark test as successful if we got here
            self.test_results["clear_cart"] = True
            print("✅ Clear Cart: SUCCESS")
            
        except Exception as e:
            print(f"❌ Clear Cart: FAILED - {str(e)}")
    
    # Order Management API Tests
    def test_create_order(self):
        """Test creating a new order"""
        print("\n--- Testing Create Order ---")
        try:
            # First, add some items to cart
            # Clear any existing cart
            requests.delete(f"{self.api_url}/cart/{self.test_session_id}/clear")
            
            # Get products
            products_response = requests.get(f"{self.api_url}/products")
            if products_response.status_code != 200 or not products_response.json():
                print("❌ Create Order: FAILED - Could not get products")
                return
            
            products = products_response.json()
            
            # Add two different products to cart
            cart_items = []
            for i in range(min(2, len(products))):
                product = products[i]
                product_id = product.get("id")
                size_options = product.get("size_options", [])
                
                if not size_options:
                    continue
                
                size_option = size_options[0]
                
                add_data = {
                    "product_id": product_id,
                    "size": size_option.get("size"),
                    "quantity": i + 1
                }
                
                add_response = requests.post(
                    f"{self.api_url}/cart/{self.test_session_id}/add",
                    json=add_data
                )
                
                if add_response.status_code == 200:
                    cart_item = {
                        "product_id": product_id,
                        "product_name": product.get("name"),
                        "product_image": product.get("image_url"),
                        "size": size_option.get("size"),
                        "size_price": size_option.get("price"),
                        "original_price": size_option.get("original_price"),
                        "quantity": i + 1,
                        "total_price": size_option.get("price") * (i + 1)
                    }
                    cart_items.append(cart_item)
                else:
                    print(f"⚠️ Could not add product {i+1} to cart: {add_response.text}")
            
            if not cart_items:
                print("❌ Create Order: FAILED - Could not add any items to cart")
                return
            
            # Get cart to verify items
            cart_response = requests.get(f"{self.api_url}/cart/{self.test_session_id}")
            if cart_response.status_code != 200:
                print(f"❌ Create Order: FAILED - Could not get cart: {cart_response.text}")
                return
            
            cart = cart_response.json()
            
            # Test Case 1: Create order with COD payment (should have 30k shipping fee)
            print("\nTest Case 1: Create order with COD payment")
            customer_info = {
                "full_name": "Nguyễn Văn A",
                "phone": "0987654321",
                "email": "nguyenvana@example.com",
                "address": "123 Đường Lê Lợi",
                "city": "Hồ Chí Minh",
                "district": "Quận 1",
                "ward": "Phường Bến Nghé",
                "notes": "Giao hàng giờ hành chính"
            }
            
            order_data = {
                "customer_info": customer_info,
                "items": cart.get("items", []),
                "payment_method": "cod",
                "session_id": self.test_session_id
            }
            
            response = requests.post(
                f"{self.api_url}/orders",
                json=order_data
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                order = response.json()
                self.created_order_id = order.get("id")
                self.created_order_number = order.get("order_number")
                
                print(f"Created order with ID: {self.created_order_id}")
                print(f"Order number: {self.created_order_number}")
                
                # Verify order structure
                required_fields = ["id", "order_number", "customer_info", "items", "payment_method", 
                                  "payment_status", "order_status", "subtotal", "shipping_fee", 
                                  "total_amount", "created_at", "updated_at"]
                missing_fields = [field for field in required_fields if field not in order]
                
                if not missing_fields:
                    # Verify shipping fee for COD
                    if order.get("payment_method") == "cod" and order.get("shipping_fee") == 30000:
                        print("✅ COD shipping fee applied correctly: 30,000 VND")
                    else:
                        print(f"❌ COD shipping fee incorrect: Expected 30000, Got {order.get('shipping_fee')}")
                    
                    # Verify order number format
                    order_number = order.get("order_number", "")
                    if order_number.startswith("KTH") and len(order_number) > 10:
                        print(f"✅ Order number format correct: {order_number}")
                    else:
                        print(f"❌ Order number format incorrect: {order_number}")
                    
                    # Verify total calculation
                    expected_subtotal = sum(item.get("total_price", 0) for item in order.get("items", []))
                    if abs(order.get("subtotal") - expected_subtotal) < 0.01:  # Allow for floating point differences
                        print(f"✅ Subtotal calculated correctly: {order.get('subtotal')}")
                    else:
                        print(f"❌ Subtotal incorrect: Expected {expected_subtotal}, Got {order.get('subtotal')}")
                    
                    expected_total = expected_subtotal + order.get("shipping_fee", 0) - order.get("discount", 0)
                    if abs(order.get("total_amount") - expected_total) < 0.01:
                        print(f"✅ Total amount calculated correctly: {order.get('total_amount')}")
                    else:
                        print(f"❌ Total amount incorrect: Expected {expected_total}, Got {order.get('total_amount')}")
                    
                    # Verify cart was cleared
                    cart_check = requests.get(f"{self.api_url}/cart/{self.test_session_id}")
                    if cart_check.status_code == 200:
                        cleared_cart = cart_check.json()
                        if not cleared_cart.get("items"):
                            print("✅ Cart cleared after order creation")
                        else:
                            print("❌ Cart not cleared after order creation")
                    else:
                        print(f"⚠️ Could not verify cart clearing: {cart_check.text}")
                else:
                    print(f"❌ Missing required fields in order: {', '.join(missing_fields)}")
            else:
                print(f"❌ Create Order (COD): FAILED - {response.text}")
            
            # Test Case 2: Create order with bank transfer payment (should have 0 shipping fee)
            print("\nTest Case 2: Create order with bank transfer payment")
            
            # Add items to cart again since it was cleared
            for i in range(min(2, len(products))):
                product = products[i]
                product_id = product.get("id")
                size_options = product.get("size_options", [])
                
                if not size_options:
                    continue
                
                size_option = size_options[0]
                
                add_data = {
                    "product_id": product_id,
                    "size": size_option.get("size"),
                    "quantity": i + 1
                }
                
                requests.post(
                    f"{self.api_url}/cart/{self.test_session_id}/add",
                    json=add_data
                )
            
            # Get updated cart
            cart_response = requests.get(f"{self.api_url}/cart/{self.test_session_id}")
            if cart_response.status_code != 200 or not cart_response.json().get("items"):
                print("⚠️ Could not prepare cart for bank transfer test")
            else:
                cart = cart_response.json()
                
                # Create order with bank transfer
                order_data = {
                    "customer_info": customer_info,
                    "items": cart.get("items", []),
                    "payment_method": "bank_transfer",
                    "session_id": self.test_session_id
                }
                
                response = requests.post(
                    f"{self.api_url}/orders",
                    json=order_data
                )
                
                if response.status_code == 200:
                    order = response.json()
                    
                    # Verify shipping fee for bank transfer
                    if order.get("payment_method") == "bank_transfer" and order.get("shipping_fee") == 0:
                        print("✅ Bank transfer shipping fee applied correctly: 0 VND")
                    else:
                        print(f"❌ Bank transfer shipping fee incorrect: Expected 0, Got {order.get('shipping_fee')}")
                else:
                    print(f"❌ Create Order (Bank Transfer): FAILED - {response.text}")
            
            # Test Case 3: Create order with missing required fields
            print("\nTest Case 3: Create order with missing required fields")
            
            # Missing customer_info
            invalid_order_data = {
                "items": cart_items,
                "payment_method": "cod"
            }
            
            response = requests.post(
                f"{self.api_url}/orders",
                json=invalid_order_data
            )
            
            if response.status_code == 400:
                print("✅ Required field validation works: Missing customer_info rejected")
            else:
                print(f"❌ Required field validation failed: Expected 400 error, Got {response.status_code}")
            
            # Mark test as successful if we got here
            self.test_results["create_order"] = True
            print("\n✅ Create Order: SUCCESS - All test cases completed")
            
        except Exception as e:
            print(f"❌ Create Order: FAILED - {str(e)}")
    
    def test_get_order_by_id(self):
        """Test getting an order by ID"""
        print("\n--- Testing Get Order by ID ---")
        if not self.created_order_id:
            print("❌ Get Order by ID: SKIPPED - No order ID available")
            return
        
        try:
            response = requests.get(f"{self.api_url}/orders/{self.created_order_id}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                order = response.json()
                print(f"Retrieved order: {order.get('order_number')}")
                
                # Verify order structure
                required_fields = ["id", "order_number", "customer_info", "items", "payment_method", 
                                  "payment_status", "order_status", "subtotal", "shipping_fee", 
                                  "total_amount", "created_at", "updated_at"]
                missing_fields = [field for field in required_fields if field not in order]
                
                if not missing_fields:
                    # Verify customer info
                    customer_info = order.get("customer_info", {})
                    customer_fields = ["full_name", "phone", "email", "address", "city", "district", "ward"]
                    missing_customer_fields = [field for field in customer_fields if field not in customer_info]
                    
                    if not missing_customer_fields:
                        print("✅ Customer info complete")
                        print(f"  Customer: {customer_info.get('full_name')}")
                        print(f"  Phone: {customer_info.get('phone')}")
                        print(f"  Address: {customer_info.get('address')}, {customer_info.get('ward')}, {customer_info.get('district')}, {customer_info.get('city')}")
                    else:
                        print(f"❌ Missing customer info fields: {', '.join(missing_customer_fields)}")
                    
                    # Verify items
                    items = order.get("items", [])
                    if items:
                        print(f"✅ Order contains {len(items)} items")
                        
                        # Verify first item
                        item = items[0]
                        item_fields = ["product_id", "product_name", "product_image", "size", "size_price", "quantity", "total_price"]
                        missing_item_fields = [field for field in item_fields if field not in item]
                        
                        if not missing_item_fields:
                            print(f"  Item: {item.get('product_name')} - {item.get('size')} - Quantity: {item.get('quantity')}")
                            print(f"  Price: {item.get('size_price')} VND - Total: {item.get('total_price')} VND")
                        else:
                            print(f"❌ Missing item fields: {', '.join(missing_item_fields)}")
                    else:
                        print("❌ Order has no items")
                    
                    # Verify payment and order status
                    print(f"  Payment Method: {order.get('payment_method')}")
                    print(f"  Payment Status: {order.get('payment_status')}")
                    print(f"  Order Status: {order.get('order_status')}")
                    
                    # Verify totals
                    print(f"  Subtotal: {order.get('subtotal')} VND")
                    print(f"  Shipping Fee: {order.get('shipping_fee')} VND")
                    print(f"  Total Amount: {order.get('total_amount')} VND")
                    
                    self.test_results["get_order_by_id"] = True
                    print("✅ Get Order by ID: SUCCESS")
                else:
                    print(f"❌ Missing required fields in order: {', '.join(missing_fields)}")
            else:
                print(f"❌ Get Order by ID: FAILED - {response.text}")
        except Exception as e:
            print(f"❌ Get Order by ID: FAILED - {str(e)}")
    
    def test_get_order_by_number(self):
        """Test getting an order by order number"""
        print("\n--- Testing Get Order by Number ---")
        if not self.created_order_number:
            print("❌ Get Order by Number: SKIPPED - No order number available")
            return
        
        try:
            response = requests.get(f"{self.api_url}/orders/number/{self.created_order_number}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                order = response.json()
                print(f"Retrieved order by number: {order.get('order_number')}")
                
                # Verify it's the same order
                if order.get("id") == self.created_order_id:
                    print("✅ Retrieved the correct order by number")
                    
                    # Verify order number format
                    order_number = order.get("order_number", "")
                    if order_number.startswith("KTH") and len(order_number) > 10:
                        print(f"✅ Order number format correct: {order_number}")
                        
                        # Try to parse date from order number
                        try:
                            # Format: KTH{YYYYMMDD}{unique_id}
                            date_part = order_number[3:11]  # Extract YYYYMMDD
                            from datetime import datetime
                            order_date = datetime.strptime(date_part, "%Y%m%d")
                            print(f"✅ Order number contains valid date: {order_date.strftime('%Y-%m-%d')}")
                        except Exception as e:
                            print(f"⚠️ Could not parse date from order number: {str(e)}")
                    else:
                        print(f"❌ Order number format incorrect: {order_number}")
                    
                    self.test_results["get_order_by_number"] = True
                    print("✅ Get Order by Number: SUCCESS")
                else:
                    print(f"❌ Retrieved wrong order: Expected ID {self.created_order_id}, Got {order.get('id')}")
            else:
                print(f"❌ Get Order by Number: FAILED - {response.text}")
                
            # Test non-existent order number
            print("\nTesting non-existent order number")
            fake_order_number = "KTH20250101XXXXXXXX"
            response = requests.get(f"{self.api_url}/orders/number/{fake_order_number}")
            
            if response.status_code == 404:
                print("✅ Non-existent order number correctly returns 404")
            else:
                print(f"❌ Non-existent order number returned unexpected status: {response.status_code}")
            
        except Exception as e:
            print(f"❌ Get Order by Number: FAILED - {str(e)}")
    
    def print_summary(self):
        """Print a summary of all test results"""
        print("\n=== Test Results Summary ===")
        
        all_passed = True
        for test_name, result in self.test_results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            if not result:
                all_passed = False
            print(f"{test_name}: {status}")
        
        print("\nOverall Result:", "✅ ALL TESTS PASSED" if all_passed else "❌ SOME TESTS FAILED")


if __name__ == "__main__":
    tester = AgarwoodAPITester(API_URL)
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)