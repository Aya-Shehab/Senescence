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

    // Get best seller product
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

    // Get top customer
    const topCustomer = await Order.aggregate([
      { $match: { createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      { $group: {
          _id: '$userId',
          name: { $first: { $concat: ['$shippingInfo.firstName', ' ', '$shippingInfo.lastName'] } },
          spend: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { spend: -1 } },
      { $limit: 1 }
    ]);

    // Get top category
    const topCategory = await Order.aggregate([
      { $match: { createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      { $unwind: '$items' },
      { $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $group: {
          _id: '$product.category',
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 1 }
    ]);

    // Get monthly sales data for the chart
    const monthlySales = await Order.aggregate([
      { $match: { 
          createdAt: { 
            $gte: new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1),
            $lte: lastDayOfMonth
          }
        }
      },
      { $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly sales data for the chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlySales = {
      labels: monthlySales.map(sale => `${months[sale._id.month - 1]} ${sale._id.year}`),
      data: monthlySales.map(sale => sale.total)
    };

    // Calculate category growth
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    const lastMonthCategorySales = await Order.aggregate([
      { $match: { createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } },
      { $unwind: '$items' },
      { $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $group: {
          _id: '$product.category',
          sales: { $sum: '$items.quantity' }
        }
      }
    ]);

    const categoryGrowth = lastMonthCategorySales.find(cat => cat._id === topCategory[0]?._id);
    const growth = categoryGrowth ? 
      ((topCategory[0].sales - categoryGrowth.sales) / categoryGrowth.sales * 100).toFixed(1) : 0;

    res.json({
      bestSeller: {
        name: bestSeller[0]?.name || 'No sales',
        revenue: bestSeller[0]?.revenue || 0,
        count: bestSeller[0]?.count || 0
      },
      topCustomer: {
        name: topCustomer[0]?.name || 'No customers',
        spend: topCustomer[0]?.spend || 0,
        orders: topCustomer[0]?.orders || 0
      },
      topCategory: {
        name: topCategory[0]?._id || 'No category',
        growth: growth,
        sales: topCategory[0]?.sales || 0
      },
      monthlySales: formattedMonthlySales
    });
  } catch (error) {
    console.error('Error in getSalesAnalytics:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
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