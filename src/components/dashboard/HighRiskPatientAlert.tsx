import Link from 'next/link'

interface HighRiskPatientAlertProps {
  overdueCount: number
  glaucomaSuspects: number
  diabeticPatients: number
  myopiaChildren: number
}

export default function HighRiskPatientAlert({
  overdueCount,
  glaucomaSuspects,
  diabeticPatients,
  myopiaChildren,
}: HighRiskPatientAlertProps) {
  if (overdueCount === 0) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Clinical Compliance: All Clear ✅
            </h3>
            <p className="mt-2 text-sm text-green-700">
              All high-risk patients are up to date with their clinical recalls. Excellent clinical governance!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            ⚠️ Clinical Compliance Alert: {overdueCount} High-Risk Patients Overdue
          </h3>
          <p className="mt-2 text-sm text-red-700">
            You have high-risk patients who are overdue for their clinical recalls. This may affect your GOC/FODO compliance status.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-4">
            {glaucomaSuspects > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-900">{glaucomaSuspects}</div>
                <div className="text-xs text-red-700">Glaucoma Suspects</div>
              </div>
            )}
            {diabeticPatients > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-900">{diabeticPatients}</div>
                <div className="text-xs text-red-700">Diabetic Patients</div>
              </div>
            )}
            {myopiaChildren > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-900">{myopiaChildren}</div>
                <div className="text-xs text-red-700">Myopia Children</div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Link
              href="/patients?filter=high-risk-overdue"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
            >
              Start Clinical Recall Campaign
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="mt-3 text-xs text-red-600">
            <strong>GOC/FODO Compliance:</strong> You have a duty of care to recall high-risk patients.
            Launching a campaign creates an audit trail for compliance documentation.
          </div>
        </div>
      </div>
    </div>
  )
}
