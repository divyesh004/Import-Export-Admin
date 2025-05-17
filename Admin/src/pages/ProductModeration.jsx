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
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
  CardActions,
  Divider,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Stack,
  Tooltip,
  Rating,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  ShoppingBag as ShoppingBagIcon,
  Block as BlockIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import productService from '../services/productService';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

const ProductModeration = () => {
  const theme = useTheme();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [action, setAction] = useState('');
  const [pendingProducts, setPendingProducts] = useState([]);
  const [rejectedProducts, setRejectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pending, rejected] = await Promise.all([
        productService.getPendingProducts(),
        productService.getRejectedProducts()
      ]);
      
      setPendingProducts(processProducts(pending));
      setRejectedProducts(processProducts(rejected));
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const processProducts = (products) => {
    return products.map(product => {
      let imageUrl = null;
      
      if (product.product_images?.length > 0) {
        imageUrl = product.product_images[0].image_url;
      } else if (product.image_url) {
        imageUrl = product.image_url;
      } else if (product.image) {
        imageUrl = product.image;
      }
      
      // Get seller information from API response
      // First check if seller property exists from API
      // Then check if users object exists with name property
      // Finally fallback to Unknown Seller
      const sellerName = product.seller || 
                         (product.users?.name) || 
                         (product.user?.name) || 
                         'Unknown Seller';
      
      return {
        ...product,
        image: imageUrl || '/placeholder-product.png',
        formattedPrice: typeof product.price === 'number' 
          ? `$${product.price.toFixed(2)}` 
          : `$${product.price}`,
        status: product.status || 'Pending',
        createdAt: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A',
        rating: product.rating || Math.random() * 2 + 3, // Random rating between 3-5 if not provided
        reviewCount: product.reviewCount || Math.floor(Math.random() * 100), // Random review count if not provided
        seller: sellerName // Ensure seller field is always populated with the best available data
      };
    });
  };

  const handleAction = (product, actionType) => {
    setSelectedProduct(product);
    setAction(actionType);
    setOpenDialog(true);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setOpenDetails(true);
  };

  const handleConfirmAction = async () => {
    try {
      setError(null);
      await productService.updateProductStatus(selectedProduct.id, action);
      await fetchProducts();
      setOpenDialog(false);
    } catch (err) {
      setError(err.message || `Failed to ${action} product`);
      console.error('Error updating product status:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderProductCard = (product) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
      <ProductCard
        product={product}
        onView={handleViewDetails}
        onApprove={(product) => handleAction(product, 'approve')}
        onReject={(product) => handleAction(product, 'reject')}
        showActions={true}
        actionButtons={{ view: true, approve: true, reject: true }}
      />
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1.5, md: 2 }, mt: 8 }}>
    

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box 
        sx={{ 
          mb: 2, 
          borderBottom: 1,
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              py: 1,
            }
          }}
        >
          <Tab 
            label={
              <Badge 
                badgeContent={pendingProducts.length} 
                color="primary"
                sx={{ mr: 1 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ShoppingBagIcon fontSize="small" />
                  <Typography variant="body2">Pending Review</Typography>
                </Stack>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={rejectedProducts.length} 
                color="error"
                sx={{ mr: 1 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BlockIcon fontSize="small" />
                  <Typography variant="body2">Rejected</Typography>
                </Stack>
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '200px',
          bgcolor: '#FFF'
        }}>
          <CircularProgress size={40} thickness={3} />
        </Box>
      ) : (
        <>
          {tabValue === 0 ? (
            pendingProducts.length > 0 ? (
              <Grid container spacing={2}>
                {pendingProducts.map(renderProductCard)}
              </Grid>
            ) : (
              <Box 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#FFF'
                }}
              >
                <InfoIcon color="primary" sx={{ fontSize: 40, mb: 1.5 }} />
                <Typography variant="h6" gutterBottom>
                  No Pending Products
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All products have been moderated. Check back later for new submissions.
                </Typography>
              </Box>
            )
          ) : (
            rejectedProducts.length > 0 ? (
              <Grid container spacing={2}>
                {rejectedProducts.map(renderProductCard)}
              </Grid>
            ) : (
              <Box 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#FFF'
                }}
              >
                <InfoIcon color="primary" sx={{ fontSize: 40, mb: 1.5 }} />
                <Typography variant="h6" gutterBottom>
                  No Rejected Products
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No products have been rejected yet.
                </Typography>
              </Box>
            )
          )}
        </>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {action === 'approve' ? (
            <CheckCircleIcon color="success" fontSize="small" />
          ) : (
            <CancelIcon color="error" fontSize="small" />
          )}
          <Typography variant="subtitle1">
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            You are about to <strong>{action}</strong> this product:
          </Typography>
          
          <Box 
            sx={{ 
              p: 1.5, 
              mb: 1.5, 
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                overflow: 'hidden',
                flexShrink: 0
              }}>
                <img 
                  src={selectedProduct?.image} 
                  alt={selectedProduct?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                  {selectedProduct?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Seller: {selectedProduct?.seller || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Price: {selectedProduct?.formattedPrice}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            {action === 'approve' 
              ? 'This product will become visible to all customers and available for purchase.'
              : 'This product will be removed from public view and cannot be purchased.'}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            size="small"
            sx={{ 
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained"
            size="small"
            color={action === 'approve' ? 'success' : 'error'}
            sx={{ 
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              }
            }}
            startIcon={action === 'approve' ? <CheckCircleIcon /> : <CancelIcon />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog 
        open={openDetails} 
        onClose={() => setOpenDetails(false)} 
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <InventoryIcon fontSize="large" />
          <Typography variant="h6" fontWeight={600}>
            Product Details
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          {selectedProduct && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Paper 
                  sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme.palette.background.default
                  }}
                >
                  <Box sx={{ 
                    width: '100%', 
                    pt: '100%', 
                    position: 'relative' 
                  }}>
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: 16
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={7}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {selectedProduct.name}
                </Typography>
                
                {/* Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating
                    value={selectedProduct.rating}
                    precision={0.1}
                    readOnly
                    size="medium"
                    emptyIcon={<StarIcon fontSize="inherit" />}
                  />
                  <Typography variant="body1" sx={{ ml: 1, fontWeight: 500 }}>
                    {selectedProduct.rating.toFixed(1)} ({selectedProduct.reviewCount} reviews)
                  </Typography>
                </Box>
                
                {/* Price */}
                <Typography 
                  variant="h3" 
                  color="primary" 
                  fontWeight={700}
                  sx={{ mb: 3 }}
                >
                  {selectedProduct.formattedPrice}
                </Typography>
                
                {/* Details List */}
                <List dense sx={{ mb: 3 }}>
                  <ListItem disablePadding sx={{ mb: 1.5 }}>
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.light', 
                        width: 36, 
                        height: 36 
                      }}>
                        <CategoryIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Category" 
                      secondary={selectedProduct.category || 'Not specified'} 
                      secondaryTypographyProps={{ 
                        variant: 'body1',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1.5 }}>
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar sx={{ 
                        bgcolor: 'secondary.light', 
                        width: 36, 
                        height: 36 
                      }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Seller" 
                      secondary={selectedProduct.seller || 'Unknown'} 
                      secondaryTypographyProps={{ 
                        variant: 'body1',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1.5 }}>
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar sx={{ 
                        bgcolor: 'info.light', 
                        width: 36, 
                        height: 36 
                      }}>
                        <CalendarIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Date Added" 
                      secondary={selectedProduct.createdAt} 
                      secondaryTypographyProps={{ 
                        variant: 'body1',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1.5 }}>
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar sx={{ 
                        bgcolor: 
                          selectedProduct.status === 'Approved' ? 'success.light' : 
                          selectedProduct.status === 'Rejected' ? 'error.light' : 
                          'warning.light', 
                        width: 36, 
                        height: 36 
                      }}>
                        <DescriptionIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip 
                          label={selectedProduct.status} 
                          size="medium"
                          color={
                            selectedProduct.status === 'Approved' ? 'success' : 
                            selectedProduct.status === 'Rejected' ? 'error' : 'warning'
                          }
                          sx={{ 
                            borderRadius: 1,
                            fontWeight: 600,
                            px: 1
                          }}
                        />
                      } 
                    />
                  </ListItem>
                </List>
                
                {/* Description */}
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: theme.palette.background.default,
                    minHeight: 120,
                  }}
                >
                  {selectedProduct.description || 'No description provided.'}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={() => setOpenDetails(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none'
            }}
          >
            Close
          </Button>
          
          {selectedProduct?.status !== 'Approved' && (
            <Button 
              onClick={() => handleAction(selectedProduct, 'approve')}
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                }
              }}
            >
              Approve
            </Button>
          )}
          
          {selectedProduct?.status !== 'Rejected' && (
            <Button 
              onClick={() => handleAction(selectedProduct, 'reject')}
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                }
              }}
            >
              Reject
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductModeration;