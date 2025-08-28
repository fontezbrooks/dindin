import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { wsManager } from '@/utils/websocket-manager';

interface PartnerStatusIndicatorProps {
  partnerId?: string;
  partnerName?: string;
}

export const PartnerStatusIndicator: React.FC<PartnerStatusIndicatorProps> = ({
  partnerId,
  partnerName = 'Partner',
}) => {
  const [isOnline, setIsOnline] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (!partnerId) return;

    const handlePartnerOnline = (userId: string) => {
      if (userId === partnerId) {
        setIsOnline(true);
        startPulseAnimation();
      }
    };

    const handlePartnerOffline = (userId: string) => {
      if (userId === partnerId) {
        setIsOnline(false);
        setIsSwiping(false);
        Animated.timing(pulseAnim).stop();
      }
    };

    const handlePartnerSwiping = (data: any) => {
      if (data.userId === partnerId) {
        setIsSwiping(true);
        // Reset swiping status after 3 seconds
        setTimeout(() => {
          setIsSwiping(false);
        }, 3000);
      }
    };

    // Subscribe to WebSocket events
    wsManager.on('partnerOnline', handlePartnerOnline);
    wsManager.on('partnerOffline', handlePartnerOffline);
    wsManager.on('partnerSwiping', handlePartnerSwiping);

    // Check initial connection status
    if (wsManager.isConnected()) {
      // Request partner status from server
      wsManager.send({
        type: 'checkPartnerStatus',
        partnerId,
      });
    }

    return () => {
      wsManager.off('partnerOnline', handlePartnerOnline);
      wsManager.off('partnerOffline', handlePartnerOffline);
      wsManager.off('partnerSwiping', handlePartnerSwiping);
    };
  }, [partnerId]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  if (!partnerId) {
    return null;
  }

  return (
    <View className="flex-row items-center bg-white rounded-lg px-3 py-2 shadow-sm">
      {/* Status Indicator */}
      <Animated.View
        style={{ transform: [{ scale: pulseAnim }] }}
        className={`w-2 h-2 rounded-full mr-2 ${
          isOnline ? (isSwiping ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-400'
        }`}
      />

      {/* Status Text */}
      <View>
        <Text className="text-sm font-medium text-gray-800">
          {partnerName}
        </Text>
        <Text className="text-xs text-gray-500">
          {isOnline ? (
            isSwiping ? 'Swiping recipes...' : 'Online'
          ) : 'Offline'}
        </Text>
      </View>
    </View>
  );
};