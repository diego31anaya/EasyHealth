import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, View, Linking, Platform, TouchableOpacity, ActivityIndicator, Text, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

interface Product {
  product_name: string;
  brands?: string;
  nutrition_grades?: string;
  nova_group?: number;
  image_url?: string;
  nutrient_levels?: {
    fats?: 'low' | 'moderate' | 'high';
    salt?: 'low' | 'moderate' | 'high';
    'saturated-fat'? : 'low' | 'moderate' | 'high';
    sugars?: 'low' | 'moderate' | 'high';
  }
}

const getNutriColor = (grade: string) => {
  const colors: Record<string, string> = {
    a: '#008b4c', b: '#85bb2f', c: '#fecb02', d: '#ee8100', e: '#e63e11'
  };
  return colors[grade.toLowerCase() || '#999'];
};

const getNovaColor = (group: number) => {
  const colors: Record<number, string> = {
    1: '#00aa00', 2: '#ffcc00', 3: '#ff6600', 4: '#ee0000'
  };
  return colors[group] || '#999';
}

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const [flashOn, setFlashOn] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const isFocused = useIsFocused();
  const isScanning = useRef(false);
  const [product, setProduct] = useState<Product | null>(null)
  const [scanned, setScanned] = useState(false)

  // Bottom Sheet Ref and Snap Points
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%', '85%'], [])

  const handleBarcodeScan = async({ type, data }: { type: string; data: string}) => {
    if (isScanning.current) return;

    isScanning.current = true;
    setScanned(true);

    try {
      const response = await fetch(
        //net for now change to org during productino
        `https://world.openfoodfacts.net/api/v2/product/${data}.json`,
        {
          headers: {
            'User-Agent': 'EasyHealth/1.0', // later add "... (myapp@example.com)

            // later make a OpenFoodFacts account and fill out the API usage form
          },
        }
      );
      const result = await response.json()

      if(result.status === 1) {
        setProduct(result.product);
        bottomSheetModalRef.current?.present();

         console.log('--- Product Found ---');
         console.log('Name:', result.product.product_name);
        console.log('Nutri-Score:', result.product.nutrition_grades?.toUpperCase() || 'N/A');
        console.log('Nova Group:', result.product.nova_group || 'N/A');
        
      } else {
        console.log('Product not found for barcode:', data)
      }
    } catch(error) {
      console.error('API error:', error)
    }

    //Allow Scanning again after 2 seconds
    setTimeout(() => {
      isScanning.current = false;
      setScanned(false);
    }, 2000)
  };

  const handleDismiss = () => {
    setScanned(false);
    isScanning.current = false;
    setProduct(null)
  }

  // Still loading permission status
  if (!permission) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  // Permission not granted — show request screen
  if (!permission.granted) {
    return (
      <ThemedView style={styles.centered}>
        <View style={styles.permissionContent}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={64} color={tintColor} />
          <ThemedText type="title" style={styles.permissionTitle}>
            Camera Access
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            EasyHealth needs your camera to scan barcodes on food and drink items.
          </ThemedText>

          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: tintColor }]}
            onPress={() => {
              if (permission.canAskAgain) {
                requestPermission();
              } else {
                // User previously denied — send them to Settings
                Linking.openSettings();
              }
            }}>
            <ThemedText style={[styles.permissionButtonText, { color: backgroundColor }]}>
              {permission.canAskAgain ? 'Allow Camera Access' : 'Open Settings'}
            </ThemedText>
          </TouchableOpacity>

          {!permission.canAskAgain && (
            <ThemedText style={styles.settingsHint}>
              You previously denied camera access. Please enable it in your device settings.
            </ThemedText>
          )}
        </View>
      </ThemedView>
    );
  }

  // Permission granted — show camera
  return (
    <View style={styles.container}>
      {isFocused ? 
      (<CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashOn}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e']
        }}
      >
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20}}>
        <TouchableOpacity
          style={[
            styles.flashButton,
            flashOn ? styles.flashButtonOn : styles.flashButtonOff
          ]}
          onPress={() => setFlashOn((prev) => !prev)}
        >
        <IconSymbol 
          name={flashOn? 'flashlight.on.fill' : 'flashlight.off.fill'}
          size={22}
          color={flashOn ? 'rgba(0,0,0,0.6)' : '#fff'}
        />
        </TouchableOpacity>
      </View>
      </CameraView>) : (
        <View style={styles.camera} />
      )}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={handleDismiss}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
      >
      <BottomSheetView style={styles.bottomSheetContainer}>
        {product ? (
          <View style={styles.productHeader}>
            {/* Product Image */}
            <View style={styles.imageContainer}>
              {product.image_url ? (
               <Image 
                source={{ uri: product.image_url }} 
                style={styles.productImage} 
                resizeMode="contain"
                />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 12 }}>No Image Available</Text>
                </View>
              )}
            </View>

            {/* Product Name and Brand*/}
              <View style={styles.productTextContainer}>
                <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.productName}>
                  {product.product_name || 'Unkown Product'}
                </ThemedText>
                <Text style={styles.productBrand}>
                  {product.brands || 'Unkown Brand'}
                </Text>
              </View>

            {/* Badge Container */}
            <View>
              {product.nutrition_grades && (
                <View>
                  <Text>
                    {product.nutrition_grades.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

          </View>
        ) : (
          <ActivityIndicator />
        )}
      </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    alignItems: 'flex-end',
    
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  permissionButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsHint: {
    textAlign: 'center',
    opacity: 0.5,
    fontSize: 13,
    marginTop: 4,
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButtonOff: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  flashButtonOn: {
    backgroundColor: 'white'
  },

  bottomSheetContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center'
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    borderWidth: 1,
  },
  imageContainer: {
    width: 92,
    height: 92,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  productTextContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  productName: {
    fontSize: 18,
    
  },
  productBrand: {
    fontSize: 14,
    color: '#8e8e93',
  }
});