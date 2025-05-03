import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  HourglassEmpty as HourglassEmptyIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import orderService from '../services/orderService';
import { motion } from 'framer-motion';

const OrderManagement = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [action, setAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters when filter states change
  useEffect(() => {
    // For client-side filtering of already fetched orders
    if (orders.length > 0) {
      applyFilters();
    }
  }, [orders, tabValue]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare params for API call
      const params = {
        status: statusFilter !== 'all' ? statusFilter.toLowerCase() : undefined,
        search: searchQuery || undefined,
        page: page + 1, // API usually uses 1-indexed pages
        pageSize: rowsPerPage
      };
      
      const data = await orderService.getAllOrders(params);
      
      // Process the data to ensure all required fields exist
      let processedOrders = [];
      
      // Check if data has the expected structure
      if (data && Array.isArray(data.orders)) {
        processedOrders = data.orders.map(order => {
          // Process shipping details
          const shippingDetails = {
            shipping_address: order.shipping_address || 'N/A',
            method: order.shipping_method || 'Standard Shipping',
            estimatedDelivery: order.estimated_delivery || 'N/A',
            city: order.shipping_city || '',
            state: order.shipping_state || '',
            zipCode: order.shipping_zip || '',
            country: order.shipping_country || order.buyer?.country || ''
          };

          return {
            ...order,
            // Ensure these fields exist with fallbacks
            // Extract order ID from seller's order if available
            id: order.seller_order?.id || order.seller_order?._id || order.id || order._id || 'N/A',
            productName: order.productName || order.product?.name || 'N/A',
            buyer: order.buyer || { name: 'N/A', country: 'N/A' },
            // Create proper seller object from seller data or seller_id
            seller: order.seller ? order.seller : 
                   order.seller_id ? { name: order.seller_id.name || order.seller_id.businessName || 'N/A', country: order.seller_id.country || 'N/A', id: order.seller_id._id || order.seller_id.id || 'N/A' } : 
                   { name: 'N/A', country: 'N/A' },
            orderDate: order.orderDate || order.createdAt || 'N/A',
            totalAmount: order.totalAmount || order.amount || 0,
            // Normalize status to ensure consistent casing
            status: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Pending Approval',
            // Add shipping details
            shippingDetails: shippingDetails
          };
        });
        
        setOrders(processedOrders);
        // If API returns total count, use it
        if (data.totalCount) {
          setTotalCount(data.totalCount);
        } else {
          setTotalCount(processedOrders.length);
        }
      } else {
        // Fallback if data structure is different
        processedOrders = Array.isArray(data) ? data.map(order => {
          // Process shipping details
          const shippingDetails = {
            shipping_address: order.shipping_address || order.address || 'N/A',
            method: order.shipping_method || 'Standard Shipping',
            estimatedDelivery: order.estimated_delivery || 'N/A',
            city: order.shipping_city || order.city || '',
            state: order.shipping_state || order.state || '',
            zipCode: order.shipping_zip || order.zipCode || order.zip || '',
            country: order.shipping_country || order.country || order.buyer?.country || ''
          };

          return {
            ...order,
            // Ensure these fields exist with fallbacks
            // Extract order ID from seller's order if available
            id: order.seller_order?.id || order.seller_order?._id || order.id || order._id || 'N/A',
            productName: order.products?.name || 'N/A',
            // Create proper buyer object from users data
            buyer: order.users ? { name: order.users.name, country: order.users.country || 'N/A' } : { name: 'N/A', country: 'N/A' },
            // Create proper seller object from seller data or seller_id
            seller: order.seller ? order.seller : 
                   order.seller_id ? { name: order.seller_id.name || order.seller_id.businessName || 'N/A', country: order.seller_id.country || 'N/A', id: order.seller_id._id || order.seller_id.id || 'N/A' } : 
                   { name: 'N/A', country: 'N/A' },
            orderDate: order.orderDate || order.created_at || order.createdAt || 'N/A',
            // Calculate totalAmount based on product price and quantity
            totalAmount: order.products && order.quantity ? order.products.price * order.quantity : order.totalAmount || order.products?.price || 0,
            // Normalize status to ensure consistent casing
            status: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Pending Approval',
            // Add shipping details
            shippingDetails: shippingDetails
          };
        }) : [];
        
        setOrders(processedOrders);
        setTotalCount(processedOrders.length);
      }
      
      console.log('Processed Orders:', processedOrders); // For debugging
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    // Apply tab filters
    if (tabValue === 1) {
      result = result.filter(order => order.status.toLowerCase() === 'pending_approval');
    } else if (tabValue === 2) {
      result = result.filter(order => order.status.toLowerCase() === 'approved');
    } 
    else if (tabValue === 3) {
      result = result.filter(order => order.status.toLowerCase() === 'in_progress');
    } else if (tabValue === 4) {
      result = result.filter(order => order.status.toLowerCase() === 'confirmed');
    } else if (tabValue === 5) {
      result = result.filter(order => order.status.toLowerCase() === 'delivered');
    } else if (tabValue === 6) {
      result = result.filter(order => order.status.toLowerCase() === 'rejected');
    }

    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      // Ensure case-insensitive comparison
      const statusFilterLower = statusFilter.toLowerCase();
      result = result.filter(order => order.status.toLowerCase() === statusFilterLower);
    }

    // Apply industry filter if not 'all'
    if (industryFilter !== 'all') {
      result = result.filter(order => order.industry === industryFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        order =>
          (order.id && order.id.toLowerCase().includes(query)) ||
          (order.productName && order.productName.toLowerCase().includes(query)) ||
          (order.buyer && order.buyer.name && order.buyer.name.toLowerCase().includes(query)) ||
          (order.seller && order.seller.name && order.seller.name.toLowerCase().includes(query))
      );
    }

    setFilteredOrders(result);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleAction = (order, actionType) => {
    setSelectedOrder(order);
    setAction(actionType);
    setOpenDialog(true);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetails(true);
  };

  const handleConfirmAction = async () => {
    try {
      setError(null);
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      // Use the rejection reason from state if status is rejected
      let reasonToSubmit = '';
      if (newStatus === 'rejected') {
        reasonToSubmit = rejectionReason;
      }
      
      await orderService.updateOrderStatus(selectedOrder.id, newStatus, reasonToSubmit);
      
      // Refresh orders after update
      fetchOrders();
      
      // Reset rejection reason and close dialog
      setRejectionReason('');
      setOpenDialog(false);
    } catch (err) {
      setError(err.message || `Failed to ${action} order`);
      console.error('Error updating order status:', err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchOrders(); // Fetch orders with new page
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchOrders(); // Fetch orders with new page size
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
    // Debounce search to avoid too many API calls
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      fetchOrders();
    }, 500));
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
    // Reset tab value when changing status filter to avoid conflicts
    setTabValue(0);
    fetchOrders();
  };

  const handleIndustryFilterChange = (event) => {
    setIndustryFilter(event.target.value);
    setPage(0);
    fetchOrders();
  };

  // Get unique industries for filter dropdown
  const industries = ['all', ...new Set(orders.map(order => order.industry))];

  // Get status options for filter dropdown
  const statusOptions = [
    'all',
    'pending approval',
    'approved',
    'in_progress',
    'confirmed',
    'delivered',
    'rejected',
    'cancelled'
  ];

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending approval':
        return theme.palette.warning.main;
      case 'approved':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.info.dark;
      case 'confirmed':
        return theme.palette.success.main;
      case 'delivered':
        return theme.palette.success.dark;
      case 'rejected':
        return theme.palette.error.main;
      case 'cancelled':
        return theme.palette.error.dark;
      default:
        return theme.palette.grey[500];
    }
  };

  // Render loading skeletons
  const renderSkeletons = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow> 
            <TableCell>Product</TableCell>
            <TableCell>Buyer</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              {[...Array(6)].map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton animation="wave" height={24} width="80%" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ p: 3, maxWidth: '100%' }}>
      <Typography 
        variant="h4" 
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          color: theme.palette.primary.main,
        flexGrow: 1, p: { xs: 2, md: 3 }, mt: 1 }}
      >
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper 
        component={motion.div}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        elevation={2} 
        sx={{ p: 2, mb: 3, borderRadius: 2 }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search Orders"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: theme.palette.primary.main }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.palette.primary.main
                }
              }}
              placeholder="Search by ID, product, buyer..."
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={handleStatusFilterChange}
                startAdornment={<FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    transition: 'all 0.3s'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.light
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)'
                  }
                }}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status} sx={{
                    borderRadius: 1,
                    mx: 0.5,
                    my: 0.25,
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.08)'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(25, 118, 210, 0.12)',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.2)'
                      }
                    }
                  }}>
                    {status === 'all' ? 'All Statuses' : (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {status !== 'all' && (
                          <Box 
                            component="span" 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: getStatusColor(status),
                              mr: 1,
                              display: 'inline-block'
                            }} 
                          />
                        )}
                        {status}
                      </Box>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Industry Filter</InputLabel>
              <Select
                value={industryFilter}
                label="Industry Filter"
                onChange={handleIndustryFilterChange}
                startAdornment={<CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    transition: 'all 0.3s'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.light
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)'
                  }
                }}
              >
                {industries.map(industry => (
                  <MenuItem key={industry} value={industry} sx={{
                    borderRadius: 1,
                    mx: 0.5,
                    my: 0.25,
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.08)'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(25, 118, 210, 0.12)',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.2)'
                      }
                    }
                  }}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper 
        component={motion.div}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        elevation={3} 
        sx={{ 
          borderRadius: 3, 
          mb: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          centered
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.dark, 0.1) : alpha(theme.palette.primary.light, 0.1),
            display: 'flex',
            justifyContent: 'center',
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center',
            },
            '& .MuiTab-root': {
              minWidth: 150,
              fontWeight: 600,
              fontSize: '0.95rem',
              py: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main
              },
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
              backgroundColor: theme.palette.primary.main
            }
          }}
        >
          <Tab 
            icon={<ReceiptIcon fontSize="small" />} 
            iconPosition="start" 
            label="All Orders" 
          />
          <Tab 
            icon={<HourglassEmptyIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <span>Pending</span>
                <Chip 
                  size="small" 
                  label={orders.filter(o => o.status.toLowerCase() === 'pending approval').length} 
                  sx={{ 
                    bgcolor: theme.palette.warning.main, 
                    color: 'white',
                    fontWeight: 'bold',
                    minWidth: 28,
                    height: 22
                  }}
                />
              </Box>
            } 
          />
          <Tab 
            icon={<CheckCircleIcon fontSize="small" color="info" />}
            iconPosition="start"
            label="Approved" 
          />
          <Tab 
            icon={<LocalShippingIcon fontSize="small" color="primary" />}
            iconPosition="start"
            label="Confirmed" 
          />
          <Tab 
            icon={<ShippingIcon fontSize="small" color="success" />}
            iconPosition="start"
            label="Delivered" 
          />
          <Tab 
            icon={<CancelIcon fontSize="small" color="error" />}
            iconPosition="start"
            label="Rejected" 
          />
        </Tabs>
      </Paper>

      {/* Orders Table */}
      {loading ? (
        renderSkeletons()
      ) : (
        <Paper 
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          elevation={3} 
          sx={{ borderRadius: 2, overflow: 'hidden' }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: theme.palette.primary.light }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Buyer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow 
                        key={order.id}
                        sx={{ 
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell>
                          <Tooltip title={order.productName} arrow>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {order.productName}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={order.buyer ? `${order.buyer.name} (${order.buyer.country})` : 'N/A'} arrow>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {order.buyer ? order.buyer.name : 'N/A'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.orderDate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            ${order.totalAmount ? order.totalAmount.toLocaleString() : '0'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            size="small"
                            sx={{ 
                              bgcolor: getStatusColor(order.status),
                              color: 'white',
                              fontWeight: 'medium'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewDetails(order)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {/* बटन हमेशा दिखाई देंगे, 'Pending Approval' स्टेटस चेक हटा दिया गया है */}
                            <Tooltip title="Approve Order">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleAction(order, 'approve')}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Order">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleAction(order, 'reject')}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <ReceiptIcon sx={{ fontSize: 60, color: 'rgba(0, 0, 0, 0.2)' }} />
                        <Typography variant="h6" color="text.secondary" fontWeight="medium">
                          No orders found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, textAlign: 'center' }}>
                          Try adjusting your search or filter criteria to find what you're looking for
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                            setIndustryFilter('all');
                            setTabValue(0);
                            fetchOrders();
                          }}
                          sx={{ 
                            mt: 1, 
                            borderRadius: 2,
                            textTransform: 'none'
                          }}
                          startIcon={<FilterListIcon />}
                        >
                          Clear all filters
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {action === 'approve' ? 'Approve Order' : 'Reject Order'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to {action} order {selectedOrder?.id}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
          
          {action === 'reject' && (
            <TextField
              margin="dense"
              label="Rejection Reason"
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Please provide a reason for rejection"
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRejectionReason('');
            setOpenDialog(false);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained" 
            color={action === 'approve' ? 'success' : 'error'}
            autoFocus
            disabled={action === 'reject' && !rejectionReason.trim()}
          >
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog 
        open={openDetails} 
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" fontWeight="bold">
                Order Details: {selectedOrder.id}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                {/* Order Status */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={selectedOrder.status} 
                      sx={{ 
                        bgcolor: getStatusColor(selectedOrder.status),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        px: 1,
                        borderRadius: '16px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                    {selectedOrder.status.toLowerCase() === 'rejected' && selectedOrder.rejectionReason && (
                      <Typography variant="body2" color="error" sx={{ ml: 2 }}>
                        Reason: {selectedOrder.rejectionReason}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                {/* Product Information */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ 
                    p: 3, 
                    height: '100%', 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Product Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" fontWeight="medium">
                      {selectedOrder.productName}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {selectedOrder.quantity} units
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Industry: {selectedOrder.industry}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                        Total Amount: ${selectedOrder.totalAmount ? selectedOrder.totalAmount.toLocaleString() : '0'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Order Details */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ 
                    p: 3, 
                    height: '100%', 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <ReceiptIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Order Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                      <Typography variant="body2">{selectedOrder.orderDate}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                      <Chip 
                        label={selectedOrder.paymentStatus} 
                        size="small" 
                        color={selectedOrder.paymentStatus?.toLowerCase() === 'paid' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Buyer Information */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Buyer Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {selectedOrder.buyer ? (
                      <>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedOrder.buyer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedOrder.buyer.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Country: {selectedOrder.buyer.country}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Buyer information not available
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                

                
                {/* Shipping Details */}
                <Grid item xs={12}>
                  <Paper elevation={1} sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <ShippingIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Shipping Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {selectedOrder.shippingDetails ? (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Shipping Method:</Typography>
                          <Typography variant="body2">{selectedOrder.shippingDetails.method}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Estimated Delivery:</Typography>
                          <Typography variant="body2">{selectedOrder.shippingDetails.estimatedDelivery}</Typography>
                        </Box>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1, border: '1px dashed rgba(0, 0, 0, 0.1)' }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                            Shipping Address:
                          </Typography>
                          <Typography variant="body2">{selectedOrder.shippingDetails.shipping_address}</Typography>
                          {selectedOrder.shippingDetails.city && (
                            <Typography variant="body2">{selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state} {selectedOrder.shippingDetails.zipCode}</Typography>
                          )}
                          {selectedOrder.shippingDetails.country && (
                            <Typography variant="body2">{selectedOrder.shippingDetails.country}</Typography>
                          )}
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Shipping details not available
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {/* बटन हमेशा दिखाई देंगे, 'Pending Approval' स्टेटस चेक हटा दिया गया है */}
              <Button 
                onClick={() => {
                  setOpenDetails(false);
                  handleAction(selectedOrder, 'reject');
                }} 
                color="error"
                variant="outlined"
                startIcon={<CancelIcon />}
              >
                Reject
              </Button>
              <Button 
                onClick={() => {
                  setOpenDetails(false);
                  handleAction(selectedOrder, 'approve');
                }} 
                color="success"
                variant="contained"
                startIcon={<CheckCircleIcon />}
              >
                Approve
              </Button>
              <Button onClick={() => setOpenDetails(false)} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrderManagement;