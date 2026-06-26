import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

export const getSales = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.query;
    const query = {};

    if (productId) {
      query.productId = productId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query).populate('productId', 'name sku price').sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const { productId, date, quantity, revenue } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Deduct stock (if needed, or just represent sales transactions)
    if (product.currentStock < quantity) {
      // Let it go through but warn, or reject. In real-world, we allow recording past sales transactions.
    }

    product.currentStock = Math.max(0, product.currentStock - quantity);
    await product.save();

    const sale = await Sale.create({
      productId,
      date: new Date(date),
      quantity,
      revenue: revenue || quantity * product.price,
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalesStats = async (req, res) => {
  try {
    const sales = await Sale.find({}).populate('productId', 'name category price');
    
    let totalRevenue = 0;
    let totalSalesCount = 0;
    const categorySales = {};
    const productSalesMap = {};

    sales.forEach(sale => {
      totalRevenue += sale.revenue;
      totalSalesCount += sale.quantity;

      if (sale.productId) {
        const prodIdStr = sale.productId._id.toString();
        const category = sale.productId.category || 'Uncategorized';

        categorySales[category] = (categorySales[category] || 0) + sale.revenue;
        
        if (!productSalesMap[prodIdStr]) {
          productSalesMap[prodIdStr] = {
            id: prodIdStr,
            name: sale.productId.name,
            sku: sale.productId.sku,
            quantitySold: 0,
            revenueGenerated: 0,
          };
        }
        productSalesMap[prodIdStr].quantitySold += sale.quantity;
        productSalesMap[prodIdStr].revenueGenerated += sale.revenue;
      }
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
      .slice(0, 5);

    const categoryBreakdown = Object.keys(categorySales).map(key => ({
      category: key,
      value: categorySales[key],
    }));

    res.json({
      totalRevenue,
      totalSalesCount,
      categoryBreakdown,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
