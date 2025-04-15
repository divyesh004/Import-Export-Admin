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
      <Card 
        component={motion.div}
        whileHover={{ y: -5, boxShadow: theme.shadows[6] }}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          border: '1px solid',
          borderColor: theme.palette.divider,
          '&:hover': {
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        {/* Product Image with Status Badge */}
        <Box sx={{ position: 'relative', pt: '75%', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={product.image}
            alt={product.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
          <Chip
            label={product.status}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              borderRadius: 1,
              fontWeight: 600,
              backgroundColor: 
                product.status === 'Approved' ? theme.palette.success.main : 
                product.status === 'Rejected' ? theme.palette.error.main : 
                theme.palette.warning.main,
              color: theme.palette.common.white,
              boxShadow: theme.shadows[2],
            }}
          />
        </Box>
        
        {/* Product Content */}
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            noWrap
            sx={{ mb: 1 }}
          >
            {product.name}
          </Typography>
          
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              value={product.rating}
              precision={0.5}
              readOnly
              size="small"
              emptyIcon={<StarIcon fontSize="inherit" />}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              ({product.reviewCount})
            </Typography>
          </Box>
          
          {/* Price */}
          <Typography 
            variant="h6" 
            color="primary" 
            fontWeight={700}
            sx={{ mb: 1.5 }}
          >
            {product.formattedPrice}
          </Typography>
          
          {/* Category and Seller */}
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip 
              icon={<CategoryIcon sx={{ fontSize: '16px !important' }} />}
              label={product.category || 'Uncategorized'}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
            <Chip 
              icon={<PersonIcon sx={{ fontSize: '16px !important' }} />}
              label={product.seller || 'Unknown'}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
          </Stack>
          
          {/* Date Added */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <CalendarIcon color="action" sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              Added: {product.createdAt}
            </Typography>
          </Box>
        </CardContent>
        
        {/* Actions */}
        <CardActions sx={{ 
          p: 1, 
          borderTop: `1px solid ${theme.palette.divider}`,
          justifyContent: 'space-between' 
        }}>
          <Tooltip title="View details">
            <IconButton
              onClick={() => handleViewDetails(product)}
              size="small"
              color="primary"
              sx={{ 
                borderRadius: 1,
                '&:hover': { 
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText 
                }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {product.status !== 'Rejected' && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Approve">
                <IconButton
                  onClick={() => handleAction(product, 'approve')}
                  size="small"
                  color="success"
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { 
                      backgroundColor: theme.palette.success.light,
                      color: theme.palette.success.contrastText 
                    }
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Reject">
                <IconButton
                  onClick={() => handleAction(product, 'reject')}
                  size="small"
                  color="error"
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { 
                      backgroundColor: theme.palette.error.light,
                      color: theme.palette.error.contrastText 
                    }
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8 }}>
    

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
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
              minHeight: 60,
              py: 1.5,
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
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <ShoppingBagIcon fontSize="medium" />
                  <Typography variant="body1" fontWeight={500}>Pending Review</Typography>
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
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <BlockIcon fontSize="medium" />
                  <Typography variant="body1" fontWeight={500}>Rejected</Typography>
                </Stack>
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '300px'
        }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <>
          {tabValue === 0 ? (
            pendingProducts.length > 0 ? (
              <Grid container spacing={3}>
                {pendingProducts.map(renderProductCard)}
              </Grid>
            ) : (
              <Paper 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  boxShadow: theme.shadows[1],
                  bgcolor: theme.palette.background.paper
                }}
              >
                <InfoIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  No Pending Products
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  All products have been moderated. Check back later for new submissions.
                </Typography>
              </Paper>
            )
          ) : (
            rejectedProducts.length > 0 ? (
              <Grid container spacing={3}>
                {rejectedProducts.map(renderProductCard)}
              </Grid>
            ) : (
              <Paper 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  boxShadow: theme.shadows[1],
                  bgcolor: theme.palette.background.paper
                }}
              >
                <InfoIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  No Rejected Products
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  No products have been rejected yet.
                </Typography>
              </Paper>
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
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: action === 'approve' ? 'success.main' : 'error.main',
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          {action === 'approve' ? (
            <CheckCircleIcon fontSize="large" />
          ) : (
            <CancelIcon fontSize="large" />
          )}
          <Typography variant="h6" fontWeight={600}>
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to <strong>{action}</strong> this product:
          </Typography>
          
          <Paper 
            sx={{ 
              p: 2, 
              mb: 2, 
              borderRadius: 1,
              borderLeft: `4px solid ${action === 'approve' ? theme.palette.success.main : theme.palette.error.main}`,
              bgcolor: theme.palette.background.default
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: 1,
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
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                  {selectedProduct?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Seller:</strong> {selectedProduct?.seller || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Price:</strong> {selectedProduct?.formattedPrice}
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Typography variant="body2" color="text.secondary">
            {action === 'approve' 
              ? 'This product will become visible to all customers and available for purchase.'
              : 'This product will be removed from public view and cannot be purchased.'}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained"
            color={action === 'approve' ? 'success' : 'error'}
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              }
            }}
            startIcon={action === 'approve' ? <CheckCircleIcon /> : <CancelIcon />}
          >
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
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