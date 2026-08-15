import { useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useOrderSubscription = (onUpdate: (payload: any) => void) => {
  useEffect(() => {
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
};
