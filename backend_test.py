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
        self.test_session_id = "test_session_123"
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