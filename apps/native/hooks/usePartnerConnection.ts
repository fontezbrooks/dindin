import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { wsManager } from '@/utils/websocket-manager';
import logger from '@/utils/logger';

export interface Partner {
  id: string;
  name: string;
  email: string;
}

export interface PartnerConnectionState {
  isConnected: boolean;
  partner: Partner | null;
  partnerCode: string | null;
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
}

export const usePartnerConnection = () => {
  const [state, setState] = useState<PartnerConnectionState>({
    isConnected: false,
    partner: null,
    partnerCode: null,
    isOnline: false,
    isLoading: false,
    error: null,
  });

  // Get profile data
  const { data: profile, refetch: refetchProfile } = trpc.user.getProfile.useQuery();

  // Partner code generation mutation
  const generateCodeMutation = trpc.user.generatePartnerCode.useMutation({
    onMutate: () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    },
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        partnerCode: data.code,
        isLoading: false,
      }));
      refetchProfile();
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    },
  });

  // Partner connection mutation
  const connectPartnerMutation = trpc.user.connectPartner.useMutation({
    onMutate: () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    },
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        partner: data.partner,
        isLoading: false,
      }));
      
      // Initialize WebSocket connection
      wsManager.connect();
      
      // Refresh profile to get updated partner info
      refetchProfile();
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    },
  });

  // Disconnect partner mutation
  const disconnectPartnerMutation = trpc.user.disconnectPartner.useMutation({
    onSuccess: () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        partner: null,
        isOnline: false,
      }));
      refetchProfile();
    },
  });

  // Update state when profile data changes
  useEffect(() => {
    if (profile) {
      setState(prev => ({
        ...prev,
        isConnected: !!profile.partnerId,
        partner: profile.partnerId ? {
          id: profile.partnerId._id || profile.partnerId,
          name: profile.partnerId.name || 'Partner',
          email: profile.partnerId.email || '',
        } : null,
        partnerCode: profile.partnerCode || null,
      }));

      // Connect WebSocket if partner exists
      if (profile.partnerId && wsManager) {
        wsManager.connect();
      }
    }
  }, [profile]);

  // Listen for partner online/offline status
  useEffect(() => {
    if (!state.partner?.id || !wsManager) return;

    const handlePartnerOnline = (userId: string) => {
      if (userId === state.partner?.id) {
        setState(prev => ({ ...prev, isOnline: true }));
      }
    };

    const handlePartnerOffline = (userId: string) => {
      if (userId === state.partner?.id) {
        setState(prev => ({ ...prev, isOnline: false }));
      }
    };

    wsManager.on('partnerOnline', handlePartnerOnline);
    wsManager.on('partnerOffline', handlePartnerOffline);

    return () => {
      wsManager.off('partnerOnline', handlePartnerOnline);
      wsManager.off('partnerOffline', handlePartnerOffline);
    };
  }, [state.partner?.id]);

  // Validate partner code format
  const isValidPartnerCode = (code: string): boolean => {
    return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
  };

  // Normalize partner code (uppercase, trim)
  const normalizePartnerCode = (code: string): string => {
    return code.toUpperCase().trim();
  };

  // Generate partner code
  const generatePartnerCode = async (): Promise<string | null> => {
    try {
      const result = await generateCodeMutation.mutateAsync();
      return result.code;
    } catch (error) {
      logger.error('Failed to generate partner code:', error);
      return null;
    }
  };

  // Connect with partner
  const connectPartner = async (partnerCode: string): Promise<boolean> => {
    const normalizedCode = normalizePartnerCode(partnerCode);
    
    if (!isValidPartnerCode(normalizedCode)) {
      setState(prev => ({
        ...prev,
        error: 'Invalid partner code format',
      }));
      return false;
    }

    try {
      await connectPartnerMutation.mutateAsync({ partnerCode: normalizedCode });
      return true;
    } catch (error) {
      logger.error('Failed to connect with partner:', error);
      return false;
    }
  };

  // Disconnect from partner
  const disconnectPartner = async (): Promise<boolean> => {
    try {
      await disconnectPartnerMutation.mutateAsync();
      return true;
    } catch (error) {
      logger.error('Failed to disconnect from partner:', error);
      return false;
    }
  };

  // Check if can connect (not already connected)
  const canConnect = (): boolean => {
    return !state.isConnected && !state.isLoading;
  };

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    // State
    ...state,
    
    // Actions
    generatePartnerCode,
    connectPartner,
    disconnectPartner,
    
    // Utilities
    isValidPartnerCode,
    normalizePartnerCode,
    canConnect,
    clearError,
    refetchProfile,
    
    // Mutations (for direct access if needed)
    generateCodeMutation,
    connectPartnerMutation,
    disconnectPartnerMutation,
  };
};