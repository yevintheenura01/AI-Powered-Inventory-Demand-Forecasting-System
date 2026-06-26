import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Plus, Edit2, Trash2, ShoppingCart, X } from 'lucide-react';

const Inventory = () => {
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct, loading, fetchSalesStats } = useStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Modals / forms state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  // Product form
  const [currentProductId, setCurrentProductId] = useState('');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [currentStock, setCurrentStock] = useState(0);
  const [safetyStock, setSafetyStock] = useState(10);
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState('units');

  // Sale form
  const [saleProductId, setSaleProductId] = useState('');
  const [saleProductName, setSaleProductName] = useState('');
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  const openAddProductModal = () => {
    setModalMode('add');
    setCurrentProductId('');
    setName('');
    setSku('');
    setCategory('Electronics');
    setCurrentStock(0);
    setSafetyStock(10);
    setPrice(0);
    setUnit('units');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setModalMode('edit');
    setCurrentProductId(product._id);
    setName(product.name);
    setSku(product.sku);
    setCategory(product.category);
    setCurrentStock(product.currentStock);
    setSafetyStock(product.safetyStock);
    setPrice(product.price);
    setUnit(product.unit);
    setIsProductModalOpen(true);
  };

  const openRecordSaleModal = (product) => {
    setSaleProductId(product._id);
    setSaleProductName(product.name);
    setSaleQuantity(1);
    setSaleDate(new Date().toISOString().split('T')[0]);
    setIsSaleModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const productPayload = {
      name,
      sku,
      category,
      currentStock: parseInt(currentStock),
      safetyStock: parseInt(safetyStock),
      price: parseFloat(price),
      unit,
    };

    try {
      if (modalMode === 'add') {
        await addProduct(productPayload);
      } else {
        await updateProduct(currentProductId, productPayload);
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: saleProductId,
          date: saleDate,
          quantity: parseInt(saleQuantity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record sale');
      }

      setIsSaleModalOpen(false);
      fetchProducts();
      fetchSalesStats();
      alert('Sale transaction recorded successfully!');
    } catch (err) {
      alert(`Error recording sale: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? All historical transactions and forecasts will be deleted.')) {
      try {
        await deleteProduct(id);
        fetchProducts();
        fetchSalesStats();
      } catch (err) {
        alert(`Error deleting product: ${err.message}`);
      }
    }
  };

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <h1>Stock Inventory Manager</h1>
          <p>Maintain catalog items, replenish count levels, and log transactions</p>
        </div>
        <button className="btn btn-primary" onClick={openAddProductModal}>
          <Plus size={16} />
          <span>New Product</span>
        </button>
      </div>

      {/* Inventory Table Card */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Safety Stock</th>
                <th>Price</th>
                <th>Alert Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state" style={{ textAlign: 'center' }}>
                    No products found. Click "New Product" to build your inventory catalog.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  let alertBadge = <span className="badge badge-success">Sufficient</span>;
                  if (product.currentStock === 0) {
                    alertBadge = <span className="badge badge-danger">Out of Stock</span>;
                  } else if (product.currentStock < product.safetyStock) {
                    alertBadge = <span className="badge badge-warning">Low Stock</span>;
                  }

                  return (
                    <tr key={product._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Unit: {product.unit}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{product.sku}</td>
                      <td>{product.category}</td>
                      <td style={{ fontWeight: 600 }}>{product.currentStock}</td>
                      <td>{product.safetyStock}</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                        ${product.price.toFixed(2)}
                      </td>
                      <td>{alertBadge}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => openRecordSaleModal(product)}
                            title="Log a transaction sale"
                          >
                            <ShoppingCart size={14} />
                            <span>Sell</span>
                          </button>
                          
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.5rem' }}
                            onClick={() => openEditProductModal(product)}
                            title="Edit product info"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 0.5rem' }}
                            onClick={() => handleDelete(product._id)}
                            title="Remove product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="btn btn-secondary"
              style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.3rem' }}
              onClick={() => setIsProductModalOpen(false)}
            >
              <X size={16} />
            </button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
              {modalMode === 'add' ? 'Add Catalog Product' : 'Modify Catalog Product'}
            </h3>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>SKU Identifier</label>
                <input
                  type="text"
                  className="form-control"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                  disabled={modalMode === 'edit'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Stock Unit</label>
                  <input
                    type="text"
                    className="form-control"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Current Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Safety Threshold</label>
                  <input
                    type="number"
                    className="form-control"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(e.target.value)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {isSaleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="btn btn-secondary"
              style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.3rem' }}
              onClick={() => setIsSaleModalOpen(false)}
            >
              <X size={16} />
            </button>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
              Record Sale Transaction
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Product: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{saleProductName}</span>
            </p>

            <form onSubmit={handleSaleSubmit}>
              <div className="form-group">
                <label>Date of Sale</label>
                <input
                  type="date"
                  className="form-control"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity Sold</label>
                <input
                  type="number"
                  className="form-control"
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsSaleModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
