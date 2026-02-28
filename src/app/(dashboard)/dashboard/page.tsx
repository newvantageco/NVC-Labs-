import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HighRiskPatientAlert from '@/components/dashboard/HighRiskPatientAlert'
import ClinicalROICalculator from '@/components/dashboard/ClinicalROICalculator'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch practice data
  const { data: practice } = await supabase
    .from('practices')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!practice) {
    redirect('/login')
  }

  // Fetch patient count
  const { count: patientCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('practice_id', practice.id)
    .eq('opted_out', false)

  // Fetch high-risk patient stats
  const today = new Date().toISOString().split('T')[0]

  const { count: overdueHighRisk } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('practice_id', practice.id)
    .neq('risk_category', 'standard')
    .lt('next_clinical_due_date', today)
    .eq('opted_out', false)

  const { count: glaucomaSuspects } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('practice_id', practice.id)
    .eq('risk_category', 'glaucoma_suspect')
    .lt('next_clinical_due_date', today)
    .eq('opted_out', false)

  const { count: diabeticPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('practice_id', practice.id)
    .eq('risk_category', 'diabetic')
    .lt('next_clinical_due_date', today)
    .eq('opted_out', false)

  const { count: myopiaChildren } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('practice_id', practice.id)
    .eq('risk_category', 'myopia_child')
    .lt('next_clinical_due_date', today)
    .eq('opted_out', false)

  // Fetch call stats
  const { data: callStats } = await supabase
    .from('call_logs')
    .select('call_status')
    .eq('practice_id', practice.id)

  const totalCalls = callStats?.length || 0
  const bookedCalls = callStats?.filter(c => c.call_status === 'booked').length || 0
  const answeredCalls = callStats?.filter(c => c.call_status === 'answered').length || 0
  const conversionRate = answeredCalls > 0 ? ((bookedCalls / answeredCalls) * 100).toFixed(1) : '0.0'

  // Fetch clinical recall stats for ROI calculator
  const { count: clinicalRecallsSent } = await supabase
    .from('call_logs')
    .select('*', { count: 'exact', head: true })
    .eq('practice_id', practice.id)
    .gte('created_at', new Date(new Date().setDate(1)).toISOString()) // This month

  const { count: clinicalAppointmentsBooked } = await supabase
    .from('call_logs')
    .select('*', { count: 'exact', head: true })
    .eq('practice_id', practice.id)
    .eq('call_status', 'booked')
    .gte('created_at', new Date(new Date().setDate(1)).toISOString()) // This month

  // Fetch recent call logs
  const { data: recentCalls } = await supabase
    .from('call_logs')
    .select(`
      *,
      patients (first_name, last_name)
    `)
    .eq('practice_id', practice.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome back to your AI call centre
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Patients
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {patientCount || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">📞</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Calls
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {totalCalls}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">✅</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Appointments Booked
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {bookedCalls}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl">📊</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Conversion Rate
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {conversionRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Compliance Alert */}
      <div className="mb-8">
        <HighRiskPatientAlert
          overdueCount={overdueHighRisk || 0}
          glaucomaSuspects={glaucomaSuspects || 0}
          diabeticPatients={diabeticPatients || 0}
          myopiaChildren={myopiaChildren || 0}
        />
      </div>

      {/* Clinical ROI Calculator */}
      {(clinicalRecallsSent || 0) > 0 && (
        <div className="mb-8">
          <ClinicalROICalculator
            highRiskPatientsRecalled={clinicalRecallsSent || 0}
            appointmentsBooked={clinicalAppointmentsBooked || 0}
            avgClinicalAppointmentValue={practice.avg_clinical_appointment_value}
          />
        </div>
      )}

      {/* Subscription Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-blue-900">
              {practice.subscription_tier.charAt(0).toUpperCase() + practice.subscription_tier.slice(1)} Plan
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              {practice.calls_used_this_month} / {practice.monthly_call_limit} calls used this month
            </p>
            <div className="mt-2 w-64 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(practice.calls_used_this_month / practice.monthly_call_limit) * 100}%`
                }}
              />
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              practice.subscription_status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {practice.subscription_status}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/patients"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <span className="text-2xl mr-3">📋</span>
            <div>
              <div className="font-medium text-gray-900">Upload Patient List</div>
              <div className="text-sm text-gray-500">Add patients via CSV</div>
            </div>
          </Link>
          <Link
            href="/calls"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <span className="text-2xl mr-3">🚀</span>
            <div>
              <div className="font-medium text-gray-900">Start Call Campaign</div>
              <div className="text-sm text-gray-500">Launch AI recall calls</div>
            </div>
          </Link>
          <Link
            href="/settings"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <div className="font-medium text-gray-900">Configure AI Script</div>
              <div className="text-sm text-gray-500">Customize call messages</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Calls</h2>
        </div>
        <div className="px-6 py-4">
          {recentCalls && recentCalls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentCalls.map((call: any) => (
                    <tr key={call.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {call.patients?.first_name} {call.patients?.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          call.call_status === 'booked' ? 'bg-green-100 text-green-800' :
                          call.call_status === 'answered' ? 'bg-blue-100 text-blue-800' :
                          call.call_status === 'no_answer' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {call.call_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(call.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {call.call_duration_seconds ? `${call.call_duration_seconds}s` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No calls yet. Upload patients and start your first campaign!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
