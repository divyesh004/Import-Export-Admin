import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
  Rating,
  Button,
  useTheme
} from '@mui/material';
import '@fontsource/inter';
import { alpha } from '@mui/material/styles';
import {
  Star as StarIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * Reusable ProductCard component for displaying product information
 * Used across all product-related pages with consistent styling
 */
const ProductCard = ({
  product,
  onView,
  onApprove,
  onReject,
  showActions = true,
  actionButtons = { view: true, approve: true, reject: true }
}) => {
  const theme = useTheme();

  // Handle missing image
  const productImage = product.image || 
    product.image_url || 
    product.product_images?.[0]?.image_url || 
    'https://via.placeholder.com/300x200?text=No+Image';

  // Format price if not already formatted
  const formattedPrice = product.formattedPrice || 
    (product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'Price not available');

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -2 }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: 'none',
        bgcolor: '#FFF',
        '&:hover': {
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Product Image with Status Badge */}
      <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={productImage}
          alt={product.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        {product.status && (
          <Chip
            label={product.status}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              borderRadius: 0,
              fontWeight: 500,
              fontSize: '0.7rem',
              height: '20px',
              backgroundColor:
                product.status.toLowerCase() === 'approved' ? alpha(theme.palette.success.main, 0.9) :
                product.status.toLowerCase() === 'rejected' ? alpha(theme.palette.error.main, 0.9) :
                alpha(theme.palette.warning.main, 0.9),
              color: theme.palette.common.white,
              boxShadow: 'none',
            }}
          />
        )}
      </Box>

      {/* Product Content */}
      <CardContent sx={{ flexGrow: 1, p: 2, pt: 1.5 }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          noWrap
          sx={{ mb: 0.5, fontFamily: '"Inter", sans-serif' }}
        >
          {product.name}
        </Typography>

        {/* Price */}
        <Typography
          variant="body1"
          color="primary"
          fontWeight={700}
          sx={{ mb: 1, fontFamily: '"Inter", sans-serif' }}
        >
          {formattedPrice}
        </Typography>
        
        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating
            value={product.rating || 0}
            precision={0.5}
            readOnly
            size="small"
            emptyIcon={<StarIcon fontSize="inherit" />}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontFamily: '"Inter", sans-serif' }}>
            ({product.reviewCount || 0})
          </Typography>
        </Box>

        {/* Seller */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontFamily: '"Inter", sans-serif' }}>
          Seller: {product.seller?.name || product.seller || 'Unknown'}
        </Typography>
        
        {/* Category */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontFamily: '"Inter", sans-serif' }}>
          Category: {product.category || 'Uncategorized'}
        </Typography>

        {/* Description - Shorter */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '22px',
            fontSize: '0.8rem',
            opacity: 0.8,
            fontFamily: '"Inter", sans-serif'
          }}
        >
          {product.description || 'No description available'}
        </Typography>
      </CardContent>

      {/* Action Buttons */}
      {showActions && (
        <Box sx={{ px: 2, pb: 2, pt: 0, mt: 'auto' }}>
          <Stack direction="row" spacing={1} justifyContent="space-between">
            {actionButtons.view && (
              <Button
                onClick={() => onView && onView(product)}
                size="small"
                startIcon={<VisibilityIcon fontSize="small" />}
                sx={{
                  bgcolor: 'transparent',
                  color: theme.palette.primary.main,
                  fontWeight: 'medium',
                  minWidth: 'auto',
                  padding: '4px 8px',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: theme.palette.primary.dark,
                  },
                }}
              >
                View
              </Button>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {actionButtons.approve && (
              <Button
                onClick={() => onApprove && onApprove(product)}
                size="small"
                startIcon={<CheckCircleIcon fontSize="small" />}
                sx={{
                  bgcolor: 'transparent',
                  color: theme.palette.success.main,
                  fontWeight: 'medium',
                  minWidth: 'auto',
                  padding: '4px 8px',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: theme.palette.success.dark,
                  },
                }}
              >
                Approve
              </Button>
            )}
            
            {actionButtons.reject && (
              <Button
                onClick={() => onReject && onReject(product)}
                size="small"
                startIcon={<CancelIcon fontSize="small" />}
                sx={{
                  bgcolor: 'transparent',
                  color: theme.palette.error.main,
                  fontWeight: 'medium',
                  minWidth: 'auto',
                  padding: '4px 8px',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: theme.palette.error.dark,
                  },
                }}
              >
                Reject
              </Button>
            )}
            </Box>
          </Stack>
        </Box>
      )}
    </Card>
  );
};

export default ProductCard;