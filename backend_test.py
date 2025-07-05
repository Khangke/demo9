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
        self.test_results = {
            "health_check": False,
            "get_products": False,
            "get_featured_products": False,
            "create_product": False,
            "get_product_by_id": False,
            "update_product": False,
            "delete_product": False,
            "sample_data": False
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
                        
                        # Print details of the new fields
                        print("\nSize Options:")
                        for size_option in sample_product.get("size_options", []):
                            print(f"  {size_option.get('size')}: {size_option.get('price')} VND (Stock: {size_option.get('stock')})")
                        
                        print("\nAdditional Images:")
                        for img in sample_product.get("additional_images", [])[:2]:  # Show first 2 images
                            print(f"  {img}")
                        
                        print("\nSpecifications:")
                        for key, value in sample_product.get("specifications", {}).items():
                            print(f"  {key}: {value}")
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
            "featured": False
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
                    if product.get(key) != value:
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