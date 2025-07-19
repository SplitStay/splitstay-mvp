import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesUpdate } from '@/types/database.types'

export const useUser = (): UseQueryResult<Tables<'user'>, Error> => {
  return useQuery<Tables<'user'>, Error>({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        throw error
      }

      return data
    },
    retry: false,
  })
}

export const useUserById = (userId: string): UseQueryResult<Tables<'user'>, Error> => {
  return useQuery<Tables<'user'>, Error>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return data
    },
    retry: false,
    enabled: !!userId,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: TablesUpdate<'user'>) => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const { data, error } = await supabase
        .from('user')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}