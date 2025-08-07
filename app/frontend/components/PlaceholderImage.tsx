import React, { useState } from 'react';
import { View, Image, StyleSheet, ImageStyle, ViewStyle, Text } from 'react-native';
import { ChefHat } from 'lucide-react-native';

interface PlaceholderImageProps {
  source: { uri: string };
  style: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  placeholderStyle?: ViewStyle;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  placeholderStyle
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError || !source?.uri) {
    return (
      <View style={[styles.placeholder, style, placeholderStyle]}>
        <ChefHat color="#f97316" size={48} />
        <Text style={styles.placeholderText}>Recipe Image</Text>
        <Text style={styles.placeholderSubtext}>Image not available</Text>
      </View>
    );
  }

  return (
    <>
      <Image
        source={source}
        style={style}
        resizeMode={resizeMode}
        onError={handleError}
        onLoad={handleLoad}
      />
      {isLoading && (
        <View style={[styles.placeholder, style, placeholderStyle, styles.loadingOverlay]}>
          <ChefHat color="#f97316" size={32} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#f97316',
    textAlign: 'center',
  },
  placeholderSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(254, 243, 199, 0.9)',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#f97316',
    textAlign: 'center',
  },
});

export default PlaceholderImage;