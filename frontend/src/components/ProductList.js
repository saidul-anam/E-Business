import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchKey, setSearchKey] = useState('');

  // Retrieve user info (to check if admin)
  const auth = localStorage.getItem('user');
  const userData = auth ? JSON.parse(auth) : {};
  const userName = userData?.name || '';

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      let result = await fetch('https://e-dashboard-k01b.onrender.com/products');
      result = await result.json();
      setAllProducts(result);
      setFilteredProducts(result);
      console.log(result)
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Filter by category + search
  const filterProducts = (category, searchTerm) => {
    let results = [...allProducts];

    // Filter by category if not "All"
    if (category !== 'All') {
      results = results.filter((item) => item.catagory === category);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      results = results.filter((item) =>
        item.name.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredProducts(results);
  };

  // Category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterProducts(category, searchKey);
  };

  // Search input
  const handleSearch = (event) => {
    const key = event.target.value;
    setSearchKey(key);
    filterProducts(selectedCategory, key);
  };

  // Delete product (admin only)
  const deleteProduct = async (id) => {
    try {
      let result = await fetch(
        `https://e-dashboard-k01b.onrender.com/product/${id}`,
        {
          method: 'DELETE',
        }
      );
      result = await result.json();
      if (result) {
        alert('Record deleted');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Add to cart (non-admin)
  const addToCart = async (product) => {
    try {
      const userId = userData._id;
      const { _id: productId, name, price, category, company } = product;
      const Quantity = '1';

      let result = await fetch('https://e-dashboard-k01b.onrender.com/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price,
          category,
          productId,
          userId,
          company,
          Quantity,
        }),
      });
      result = await result.json();
      console.warn('Add to cart response:', result);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Unique categories
  const categories = ['All', ...new Set(allProducts.map((p) => p.category))];

  return (
    <>
     

      {/* DASHBOARD LAYOUT */}
      <div className="dashboard-container">
        {/* SIDEBAR */}
        <div className="sidebar">
          <h3>Filter by Category</h3>
          <ul>
            {categories.map((cat) => (
              <li
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  fontWeight: cat === selectedCategory ? 'bold' : 'normal',
                  color: cat === selectedCategory ? 'var(--highlight-color)' : '',
                }}
              >
                {cat}
              </li>
            ))}
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          <h2 style={{ textAlign: 'center', marginTop: '0' }}>Product List</h2>

          {/* SEARCH BOX */}
          <input
            type="text"
            placeholder="Search Product"
            className="search-product-box"
            value={searchKey}
            onChange={handleSearch}
          />

          {/* PRODUCT GRID */}
          <div className="product-list">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item, index) => (
                <ul key={item._id}>
                  {/* IMAGE AT TOP, UNIFORM SIZE */}
                  <li>
                    {item.image && item.image.data ? (
                      <img
                        src={`data:${item.image.contentType};base64,${item.image.data}`}
                        alt={item.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="product-image no-image">No Image</div>
                    )}
                  </li>

                  {/* PRODUCT DETAILS */}
                  <li>
                    <strong>
                      {index + 1}. {item.name}
                    </strong>
                  </li>
                  <li>Price: ${item.price}</li>
                  <li>Category: {item.category}</li>
                  <li>Company: {item.company}</li>

                  {/* OPERATION BUTTONS */}
                  <li className="operation-buttons">
                    {userName === 'admin' ? (
                      <>
                        <button
                          className="appbutton"
                          onClick={() => deleteProduct(item._id)}
                        >
                          Delete
                        </button>
                        <Link className="appbutton" to={`/update/${item._id}`}>
                          Update
                        </Link>
                      </>
                    ) : (
                      <button
                        className="appbutton"
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </li>
                </ul>
              ))
            ) : (
              <h3 style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                No Results Found
              </h3>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductList;
