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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import productService from '../services/productService';
import { motion } from 'framer-motion';
import { Inventory as InventoryIcon } from '@mui/icons-material';

const ProductModeration = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [action, setAction] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pendingProducts, rejectedProducts] = await Promise.all([
        productService.getPendingProducts(),
        productService.getRejectedProducts()
      ]);
      
      // Transform products to ensure image_url is properly mapped
      const transformedProducts = [...pendingProducts, ...rejectedProducts].map(product => {
        // Check if product has product_images array
        let imageUrl = null;
        
        if (product.product_images && product.product_images.length > 0) {
          // Get the first image URL from product_images array
          imageUrl = product.product_images[0].image_url;
        } else if (product.image_url) {
          // Fallback to direct image_url if available
          imageUrl = product.image_url;
        } else if (product.image) {
          // Fallback to legacy image field
          imageUrl = product.image;
        }
        
        return {
          ...product,
          // Set both image and image_url for compatibility
          image: imageUrl,
          image_url: imageUrl
        };
      });
      
      setProducts(transformedProducts);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
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
      await fetchProducts(); // Refresh the products list
      setOpenDialog(false);
    } catch (err) {
      setError(err.message || `Failed to ${action} product`);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(63, 81, 181, 0.2)',
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          Product Moderation
        </Typography>
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.1)',
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                  sx={{
                    objectFit: 'cover',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {product.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Seller: {product.seller}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${product.price}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={product.status}
                      color={product.status === 'Approved' ? 'success' : 'warning'}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewDetails(product)}
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <Box>
                    <IconButton
                      color="success"
                      onClick={() => handleAction(product, 'approve')}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleAction(product, 'reject')}
                      size="small"
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Approval/Rejection Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }
        }}
        TransitionComponent={motion.div}
      >
        <DialogTitle sx={{ 
          bgcolor: action === 'approve' ? 'success.light' : 'error.light',
          color: 'white',
          py: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {action === 'approve' ? 
              <CheckCircleIcon sx={{ mr: 1 }} /> : 
              <CancelIcon sx={{ mr: 1 }} />
            }
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to <strong>{action}</strong> the following product?
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'background.paper',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            mb: 2,
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {selectedProduct?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seller: {selectedProduct?.seller}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Price: ${selectedProduct?.price}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. Please confirm your decision.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color={action === 'approve' ? 'success' : 'error'}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              boxShadow: action === 'approve' ? 
                '0 4px 12px rgba(76, 175, 80, 0.2)' : 
                '0 4px 12px rgba(244, 67, 54, 0.2)',
              px: 3,
            }}
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
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }
        }}
        TransitionComponent={motion.div}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InventoryIcon sx={{ mr: 1 }} />
            Product Details
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="300"
                      image={selectedProduct.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={selectedProduct.name}
                    />
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <CardContent>
                    <Typography variant="h6">{selectedProduct.name}</Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Category: {selectedProduct.category}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Seller: {selectedProduct.seller}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Price: {selectedProduct.price}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedProduct.description}
                    </Typography>
                  </CardContent>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenDetails(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
          <Button 
            onClick={() => handleAction(selectedProduct, 'approve')}
            color="success"
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
              ml: 1,
            }}
          >
            Approve
          </Button>
          <Button 
            onClick={() => handleAction(selectedProduct, 'reject')}
            color="error"
            variant="contained"
            startIcon={<CancelIcon />}
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
              ml: 1,
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductModeration;