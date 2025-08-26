import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesUpdate } from '@/types/database.types'

export const useUser = (): UseQueryResult<Tables<'user'> | undefined, Error> => {
  return useQuery<Tables<'user'> | undefined, Error>({
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
        // If the user row doesn't exist yet (new OAuth sign-in), don't throw; let UI render and recover
        // PostgREST not found error code is PGRST116
        // @ts-expect-error error may have code
        if ((error as any).code === 'PGRST116') {
          return undefined
        }
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

export const useUserByCustomUrl = (customUrl: string): UseQueryResult<Tables<'user'>, Error> => {
  return useQuery<Tables<'user'>, Error>({
    queryKey: ['user', 'customUrl', customUrl],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .ilike('personalizedLink', customUrl)
        .single()

      if (error) {
        throw error
      }

      return data
    },
    retry: false,
    enabled: !!customUrl,
  })
}

export const useUserByIdOrCustomUrl = (identifier: string): UseQueryResult<Tables<'user'>, Error> => {
  return useQuery<Tables<'user'>, Error>({
    queryKey: ['user', 'identifier', identifier],
    queryFn: async () => {
      if (!identifier) {
        throw new Error('No identifier provided')
      }

      // First try to fetch by customized URL (case-insensitive)
      const { data: customUrlData, error: customUrlError } = await supabase
        .from('user')
        .select('*')
        .eq('personalizedLink', identifier)
        .single()

      if (customUrlData && !customUrlError) {
        return customUrlData
      }

      // If not found by custom URL, try by ID
      const { data: idData, error: idError } = await supabase
        .from('user')
        .select('*')
        .eq('id', identifier)
        .single()

      if (idError) {
        throw idError
      }

      return idData
    },
    retry: false,
    enabled: !!identifier,
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