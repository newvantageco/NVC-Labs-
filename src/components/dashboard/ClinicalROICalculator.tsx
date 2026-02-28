interface ClinicalROICalculatorProps {
  highRiskPatientsRecalled: number
  appointmentsBooked: number
  avgClinicalAppointmentValue: number
}

export default function ClinicalROICalculator({
  highRiskPatientsRecalled,
  appointmentsBooked,
  avgClinicalAppointmentValue,
}: ClinicalROICalculatorProps) {
  const conversionRate = highRiskPatientsRecalled > 0
    ? ((appointmentsBooked / highRiskPatientsRecalled) * 100).toFixed(1)
    : '0.0'

  const clinicalRevenue = appointmentsBooked * avgClinicalAppointmentValue
  const standardRevenue = appointmentsBooked * 20 // Average basic NHS test profit
  const uplift = standardRevenue > 0
    ? (((clinicalRevenue - standardRevenue) / standardRevenue) * 100).toFixed(0)
    : '0'

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Clinical Recall ROI
        </h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          This Month
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{highRiskPatientsRecalled}</div>
          <div className="text-xs text-gray-600">Patients Recalled</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{appointmentsBooked}</div>
          <div className="text-xs text-gray-600">Appointments Booked</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
          <div className="text-xs text-gray-600">Conversion Rate</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-indigo-600">£{avgClinicalAppointmentValue}</div>
          <div className="text-xs text-gray-600">Avg Value/Appt</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-gray-600">Clinical Recall Revenue</div>
            <div className="text-3xl font-bold text-green-600">£{clinicalRevenue.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">vs. Standard Recall</div>
            <div className="text-lg font-medium text-gray-500">£{standardRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Revenue Uplift</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-lg font-bold bg-green-100 text-green-800">
            +{uplift}% 🚀
          </span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-100 rounded-lg">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="ml-3 text-sm text-blue-800">
            <strong>Clinical recalls generate 3-5x higher revenue</strong> than standard recalls because they include OCT scans, visual field tests, and extended consultations.
          </p>
        </div>
      </div>
    </div>
  )
}
