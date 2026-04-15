import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { FileText, Loader2 } from 'lucide-react'

export default function PublicTermsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('court_settings')
        .select('terms_and_conditions, updated_at')
        .eq('id', 1)
        .single()
      if (error) throw new Error(error.message)
      return data
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
            <p className="text-sm text-gray-500">The Shuttle Badminton Court</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center py-8">
              Unable to load Terms & Conditions. Please try again later.
            </p>
          )}

          {!isLoading && !error && (
            <>
              {data?.terms_and_conditions ? (
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {data.terms_and_conditions}
                </div>
              ) : (
                <p className="text-center text-gray-400 italic py-8">
                  No Terms & Conditions have been published yet.
                </p>
              )}
              {data?.updated_at && (
                <p className="text-xs text-gray-400 mt-8 pt-4 border-t">
                  Last updated: {new Date(data.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} The Shuttle Badminton Court
        </p>
      </div>
    </div>
  )
}
