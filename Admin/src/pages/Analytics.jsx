import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import analyticsService from '../services/analyticsService';
import { useAuth } from '../services/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  People as PeopleIcon,
  MonetizationOn as MonetizationIcon,
  ShoppingCart as CartIcon,
  TrendingUp as TrendIcon,
  DateRange as DateIcon
} from '@mui/icons-material';

const Analytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add industry filter for sub-admin users
      const filters = { 
        period: timeRange,
        // Add industry parameter if user is a sub-admin
        industry: user?.role === 'sub-admin' ? user.industry : undefined
      };
      
      console.log('Fetching analytics with filters:', filters);

      const [users, platform, sales] = await Promise.all([
        analyticsService.getUserAnalytics(filters),
        analyticsService.getPlatformAnalytics(filters),
        analyticsService.getSalesAnalytics(filters)
      ]);

      setCustomerData(users.data || users || null);
      setPlatformData(platform.data || platform || null);
      
      const formattedSalesData = sales.data || sales || [];
      const chartData = Array.isArray(formattedSalesData) ? formattedSalesData : 
        Object.entries(formattedSalesData).map(([key, value]) => ({
          name: key,
          value: value
        }));
      
      setSalesData(chartData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const metricCards = [
    {
      title: "Total Revenue",
      value: `₹${platformData?.totalRevenue?.toLocaleString() || 0}`,
      icon: <MonetizationIcon fontSize="large" />,
      color: theme.palette.primary.main,
      trend: platformData?.revenueGrowthRate || 0
    },
    {
      title: "Active Customers",
      value: customerData?.activeUsers?.toLocaleString() || 0,
      icon: <PeopleIcon fontSize="large" />,
      color: theme.palette.success.main,
      trend: platformData?.userGrowthRate || 0
    },
    {
      title: "New Customers",
      value: customerData?.newUsers?.toLocaleString() || 0,
      icon: <PeopleIcon fontSize="large" />,
      color: theme.palette.warning.main,
      trend: customerData?.newUserGrowthRate || 0
    },
    {
      title: "Avg. Order Value",
      value: `₹${platformData?.averageOrderValue?.toFixed(2) || 0}`,
      icon: <CartIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      trend: platformData?.aovGrowthRate || 0
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 4, mt: 8 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {user?.role === 'sub-admin' && user?.industry && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Showing analytics for {user.industry} industry
        </Alert>
      )}
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 4,
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Insights and performance metrics
          </Typography>
        </Box>
        
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel sx={{ display: 'flex', alignItems: 'center' }}>
            <DateIcon sx={{ mr: 1, fontSize: 20 }} /> Time Range
          </InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
            sx={{ borderRadius: 3 }}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{
                    bgcolor: `${card.color}20`,
                    p: 1.5,
                    borderRadius: 3,
                    color: card.color
                  }}>
                    {card.icon}
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mt: 1
                }}>
                  <TrendIcon 
                    sx={{ 
                      color: card.trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      transform: card.trend >= 0 ? 'none' : 'rotate(180deg)',
                      mr: 1
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: card.trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 500
                    }}
                  >
                    {Math.abs(card.trend)}% {card.trend >= 0 ? 'increase' : 'decrease'} from last period
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Customer Growth */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              p: 2, 
              height: 400,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Customer Growth
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart
                  data={[
                    { name: 'Total', value: customerData?.totalUsers || 0 },
                    { name: 'Active', value: customerData?.activeUsers || 0 },
                    { name: 'New', value: customerData?.newUsers || 0 }
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 12,
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    activeDot={{ r: 8 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Customer Activity */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              p: 2, 
              height: 400,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Customer Activity
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={[
                    { subject: 'Active Rate', A: (customerData?.activeUsers / customerData?.totalUsers * 100) || 0 },
                    { subject: 'Growth Rate', A: platformData?.userGrowthRate || 0 },
                    { subject: 'Retention', A: platformData?.retentionRate || 0 },
                    { subject: 'Engagement', A: platformData?.engagementRate || 0 }
                  ]}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 12,
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Radar
                    name="Rate"
                    dataKey="A"
                    stroke={theme.palette.secondary.main}
                    fill={theme.palette.secondary.main}
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Sales Performance */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              p: 2, 
              height: 400,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Sales Performance
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 12,
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Bar
                    dataKey="value"
                    name="Sales"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Revenue Breakdown */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              p: 2, 
              height: 400,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Revenue Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Product A', value: 400 },
                      { name: 'Product B', value: 300 },
                      { name: 'Product C', value: 200 },
                      { name: 'Product D', value: 100 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[0, 1, 2, 3].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 12,
                      boxShadow: theme.shadows[3]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics;