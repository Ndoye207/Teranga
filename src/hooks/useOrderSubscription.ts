import { useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useOrderSubscription = (
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void
) => {
  useEffect(() => {
    const channelName = `orders-channel-${Date.now()}-${Math.random()}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (onInsert) onInsert(payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (onUpdate) onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInsert, onUpdate]);
};
