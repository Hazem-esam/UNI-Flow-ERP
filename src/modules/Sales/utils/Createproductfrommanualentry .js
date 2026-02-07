/**
 * Automatically creates a product with its required unit and category
 * when the inventory module is disabled (manual entry mode)
 * 
 * @param {string} productName - Name of the product to create
 * @param {string} unitName - Name/symbol of the unit (e.g., "kg", "pcs", "unit")
 * @param {object} options - Optional parameters
 * @returns {Promise<{productId: number, unitId: number, categoryId: number}>}
 */
export async function createProductFromManualEntry(
  productName,
  unitName = "unit",
  options = {}
) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225";
  
  // Get auth token
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Not authenticated");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    console.log(`🔄 Starting auto-creation for product: "${productName}" with unit: "${unitName}"`);

    // Step 1: Create or find Unit of Measure
    let unitId = null;
    
    // First try to find existing unit
    try {
      const unitsResponse = await fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
        headers,
      });
      
      if (unitsResponse.ok) {
        const existingUnits = await unitsResponse.json();
        const foundUnit = existingUnits.find(
          (u) => 
            u.name?.toLowerCase() === unitName.toLowerCase() ||
            u.symbol?.toLowerCase() === unitName.toLowerCase()
        );
        
        if (foundUnit) {
          unitId = foundUnit.id;
          console.log(`✓ Found existing unit: ${foundUnit.name} (ID: ${unitId})`);
        }
      }
    } catch (err) {
      console.warn("Could not fetch existing units:", err);
    }

    // Create new unit if not found
    if (!unitId) {
      console.log(`📝 Creating new unit: "${unitName}"`);
      
      const unitPayload = {
        name: unitName,
        symbol: unitName.substring(0, 10), // Limit symbol length
      };
      
      console.log("Unit payload:", JSON.stringify(unitPayload, null, 2));

      const unitResponse = await fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
        method: "POST",
        headers,
        body: JSON.stringify(unitPayload),
      });

      if (!unitResponse.ok) {
        const errorText = await unitResponse.text();
        console.error("Unit creation failed:", errorText);
        throw new Error(`Failed to create unit: ${errorText}`);
      }

      const createdUnit = await unitResponse.json();
      unitId = createdUnit.id;
      console.log(`✅ Created new unit: ${unitName} (ID: ${unitId})`);
    }

    // Step 2: Create or find Category (default to "General")
    let categoryId = null;
    const defaultCategoryName = options.categoryName || "General";

    // Try to find existing category
    try {
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/Category`, {
        headers,
      });
      
      if (categoriesResponse.ok) {
        const existingCategories = await categoriesResponse.json();
        const foundCategory = existingCategories.find(
          (c) => c.name?.toLowerCase() === defaultCategoryName.toLowerCase()
        );
        
        if (foundCategory) {
          categoryId = foundCategory.id;
          console.log(`✓ Found existing category: ${foundCategory.name} (ID: ${categoryId})`);
        }
      }
    } catch (err) {
      console.warn("Could not fetch existing categories:", err);
    }

    // Create new category if not found
    if (!categoryId) {
      console.log(`📝 Creating new category: "${defaultCategoryName}"`);
      
      const categoryPayload = {
        name: defaultCategoryName,
        description: "Auto-generated category for manual product entry",
      };
      
      console.log("Category payload:", JSON.stringify(categoryPayload, null, 2));

      const categoryResponse = await fetch(`${API_BASE_URL}/api/Category`, {
        method: "POST",
        headers,
        body: JSON.stringify(categoryPayload),
      });

      if (!categoryResponse.ok) {
        const errorText = await categoryResponse.text();
        console.error("Category creation failed:", errorText);
        throw new Error(`Failed to create category: ${errorText}`);
      }

      const createdCategory = await categoryResponse.json();
      categoryId = createdCategory.id;
      console.log(`✅ Created new category: ${defaultCategoryName} (ID: ${categoryId})`);
    }

    // Step 3: Create the Product
    console.log(`📝 Creating product: "${productName}"`);
    
    const productPayload = {
      code: options.code || `AUTO-${Date.now()}`,
      name: productName,
      description: options.description || `Auto-generated product: ${productName}`,
      categoryId: categoryId,
      unitOfMeasureId: unitId,
      defaultPrice: parseFloat(options.defaultPrice) || 0,
      minQuantity: parseFloat(options.minQuantity) || 0,
      barcode: options.barcode || "",
    };
    
    console.log("Product payload:", JSON.stringify(productPayload, null, 2));

    const productResponse = await fetch(`${API_BASE_URL}/api/Products`, {
      method: "POST",
      headers,
      body: JSON.stringify(productPayload),
    });

    if (!productResponse.ok) {
      const errorText = await productResponse.text();
      console.error("Product creation failed:", errorText);
      throw new Error(`Failed to create product: ${errorText}`);
    }

    const createdProduct = await productResponse.json();
    console.log(`✅ Created product: ${productName} (ID: ${createdProduct.id})`);
    console.log(`🎉 Complete! Product ID: ${createdProduct.id}, Unit ID: ${unitId}, Category ID: ${categoryId}`);

    return {
      productId: createdProduct.id,
      unitId: unitId,
      categoryId: categoryId,
    };
  } catch (error) {
    console.error("❌ Error in createProductFromManualEntry:", error);
    throw error;
  }
}