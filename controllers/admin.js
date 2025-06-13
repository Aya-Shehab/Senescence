import Order from '../models/order.js';
import CustomOrder from '../models/customOrder.js';
import Product from '../models/product.js';
import User from '../models/user.js';

// ... existing code ...

export const getSalesAnalytics = async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get best seller product with proper aggregation
    const bestSeller = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          status: { $ne: 'Cancelled' } // Exclude cancelled orders
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          count: { $sum: '$items.quantity' },
          revenue: { 
            $sum: { 
              $multiply: ['$items.price', '$items.quantity'] 
            } 
          }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 1 }
    ]);

    // Get top customer
    const topCustomer = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          status: { $ne: 'Cancelled' } // Exclude cancelled orders
        } 
      },
      {
        $group: {
          _id: '$userId',
          name: { $first: { $concat: ['$shippingInfo.firstName', ' ', '$shippingInfo.lastName'] } },
          spend: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { spend: -1 } },
      { $limit: 1 }
    ]);

    // Get highest growth category
    const categoryGrowth = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          status: { $ne: 'Cancelled' } // Exclude cancelled orders
        } 
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          sales: { 
            $sum: { 
              $multiply: ['$items.price', '$items.quantity'] 
            } 
          },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 1 }
    ]);

    // Get monthly sales data for the chart
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' } // Exclude cancelled orders
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Format the response
    const response = {
      bestSeller: bestSeller[0] || { name: 'No sales', count: 0, revenue: 0 },
      topCustomer: topCustomer[0] || { name: 'No customers', spend: 0, orders: 0 },
      topCategory: categoryGrowth[0] || { _id: 'No sales', sales: 0, count: 0 },
      monthlySales: monthlySales.map(sale => ({
        month: new Date(sale._id.year, sale._id.month - 1).toLocaleString('default', { month: 'short' }),
        total: sale.totalSales
      }))
    };

    console.log('Sales analytics response:', response); // Debug log
    res.json(response);
  } catch (error) {
    console.error('Error getting sales analytics:', error);
    res.status(500).json({ error: 'Failed to get sales analytics' });
  }
};

export const getDashboardOverview = async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get best seller of the month
    const bestSeller = await Order.aggregate([
      { $match: { createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 1 }
    ]);

    // Get total sales for current month
    const currentMonthSales = await Order.aggregate([
      { $match: { createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      { $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get total sales for last month
    const lastMonthSales = await Order.aggregate([
      { $match: { createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } },
      { $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get total orders for current month
    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });

    // Get total orders for last month
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
    });

    // Get total customer orders value
    const customerOrdersValue = await Order.aggregate([
      { $match: { createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      { $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get profit data (assuming 30% profit margin)
    const profit = currentMonthSales[0]?.total * 0.3 || 0;

    // Calculate growth percentages
    const salesGrowth = lastMonthSales[0]?.total ? 
      ((currentMonthSales[0]?.total - lastMonthSales[0].total) / lastMonthSales[0].total * 100).toFixed(2) : 0;
    
    const ordersGrowth = lastMonthOrders ? 
      ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(2) : 0;

    // Get yearly income data
    const yearlyIncome = await Order.aggregate([
      { $match: { 
          createdAt: { 
            $gte: new Date(currentDate.getFullYear(), 0, 1),
            $lte: new Date(currentDate.getFullYear(), 11, 31)
          }
        }
      },
      { $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format yearly income data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedYearlyIncome = {
      labels: months,
      data: months.map((_, index) => {
        const monthData = yearlyIncome.find(item => item._id === index + 1);
        return monthData ? monthData.total : 0;
      })
    };

    res.json({
      bestSeller: {
        name: bestSeller[0]?.name || 'No sales',
        revenue: bestSeller[0]?.revenue || 0,
        count: bestSeller[0]?.count || 0,
        targetPercentage: 78 // This could be calculated based on your business goals
      },
      sales: {
        total: currentMonthSales[0]?.total || 0,
        growth: salesGrowth
      },
      orders: {
        total: currentMonthOrders,
        growth: ordersGrowth
      },
      customerOrders: {
        value: customerOrdersValue[0]?.total || 0,
        growth: 9.8 // This could be calculated based on your business metrics
      },
      profit: {
        total: profit,
        chart: {
          data: [20, 40, 80, 60, 30], // This could be actual profit data over time
          labels: ['Jan', 'Apr', 'Jul', 'Oct', 'Dec']
        }
      },
      yearlyIncome: formattedYearlyIncome
    });
  } catch (error) {
    console.error('Error in getDashboardOverview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
}; 