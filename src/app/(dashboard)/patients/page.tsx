'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function PatientsPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
    details?: { total: number; imported: number; skipped: number }
  }>({ type: null, message: '' })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a CSV file'
      })
      return
    }

    setUploading(true)
    setUploadStatus({ type: null, message: '' })

    try {
      const text = await file.text()
      const rows = text.split('\n').map(row => row.split(','))

      // Validate headers
      const headers = rows[0].map(h => h.trim().toLowerCase())
      const requiredHeaders = ['first_name', 'last_name', 'phone_number']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

      if (missingHeaders.length > 0) {
        setUploadStatus({
          type: 'error',
          message: `Missing required columns: ${missingHeaders.join(', ')}`
        })
        setUploading(false)
        return
      }

      // Get column indexes
      const firstNameIdx = headers.indexOf('first_name')
      const lastNameIdx = headers.indexOf('last_name')
      const phoneIdx = headers.indexOf('phone_number')
      const lastTestIdx = headers.indexOf('last_eye_test_date')
      const riskCategoryIdx = headers.indexOf('risk_category')
      const lastClinicalIdx = headers.indexOf('last_clinical_test_date')
      const clinicalNotesIdx = headers.indexOf('clinical_condition_notes')

      // Get current user and practice
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUploadStatus({ type: 'error', message: 'Not authenticated' })
        setUploading(false)
        return
      }

      const { data: practice } = await supabase
        .from('practices')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!practice) {
        setUploadStatus({ type: 'error', message: 'Practice not found' })
        setUploading(false)
        return
      }

      // Process patients
      const patients = []
      let skipped = 0

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row.length < requiredHeaders.length) {
          skipped++
          continue
        }

        const patient = {
          practice_id: practice.id,
          first_name: row[firstNameIdx]?.trim(),
          last_name: row[lastNameIdx]?.trim(),
          phone_number: row[phoneIdx]?.trim(),
          last_eye_test_date: lastTestIdx !== -1 ? row[lastTestIdx]?.trim() || null : null,
          risk_category: riskCategoryIdx !== -1 ? row[riskCategoryIdx]?.trim() || 'standard' : 'standard',
          last_clinical_test_date: lastClinicalIdx !== -1 ? row[lastClinicalIdx]?.trim() || null : null,
          clinical_condition_notes: clinicalNotesIdx !== -1 ? row[clinicalNotesIdx]?.trim() || null : null,
        }

        // Basic validation
        if (!patient.first_name || !patient.last_name || !patient.phone_number) {
          skipped++
          continue
        }

        patients.push(patient)
      }

      // Insert patients
      const { error } = await supabase
        .from('patients')
        .insert(patients)

      if (error) {
        setUploadStatus({
          type: 'error',
          message: `Failed to import: ${error.message}`
        })
      } else {
        setUploadStatus({
          type: 'success',
          message: 'Patients imported successfully!',
          details: {
            total: rows.length - 1,
            imported: patients.length,
            skipped: skipped
          }
        })
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to process CSV file'
      })
    }

    setUploading(false)
  }

  const downloadTemplate = () => {
    const template = `first_name,last_name,phone_number,last_eye_test_date,risk_category,last_clinical_test_date,clinical_condition_notes
John,Smith,07700900123,2024-01-15,diabetic,2024-01-15,Type 2 diabetes - annual review required
Sarah,Jones,07700900456,2023-06-20,glaucoma_suspect,2023-06-20,Family history glaucoma - IOP 22mmHg
Emma,Williams,07700900789,2023-09-10,myopia_child,2023-09-10,6-year-old - myopia progression monitoring
James,Brown,07700900321,2022-03-05,standard,,,`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nvc-labs-patient-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <p className="mt-2 text-sm text-gray-700">
          Upload your patient list to start automated recalls
        </p>
      </div>

      {/* Upload Status */}
      {uploadStatus.type && (
        <div className={`mb-6 p-4 rounded-lg ${uploadStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start">
            {uploadStatus.type === 'success' ? (
              <svg className="h-5 w-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <div className={`text-sm ${uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              <strong>{uploadStatus.message}</strong>
              {uploadStatus.details && (
                <div className="mt-2">
                  <div>Total rows: {uploadStatus.details.total}</div>
                  <div>Successfully imported: {uploadStatus.details.imported}</div>
                  {uploadStatus.details.skipped > 0 && (
                    <div>Skipped (invalid data): {uploadStatus.details.skipped}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CSV Upload */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Patient CSV</h2>

          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
              disabled={uploading}
            />

            <div className="text-6xl mb-4">📊</div>

            {uploading ? (
              <div>
                <div className="text-lg font-medium text-gray-900 mb-2">Uploading...</div>
                <div className="text-sm text-gray-600">Processing your patient list</div>
              </div>
            ) : (
              <>
                <div className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your CSV file here
                </div>
                <div className="text-sm text-gray-600 mb-4">or</div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Choose File
                </label>
              </>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV Template
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>CSV Format:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong>Required:</strong> first_name, last_name, phone_number</li>
                <li><strong>Optional:</strong> last_eye_test_date, risk_category, last_clinical_test_date, clinical_condition_notes</li>
                <li><strong>Risk categories:</strong> standard, diabetic, glaucoma_suspect, myopia_child, other_clinical</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Practice Management Software Integration */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Practice Management Software Integration
          </h2>

          <p className="text-gray-600 mb-6">
            Connect your practice management system to automatically sync patient data.
          </p>

          <div className="space-y-4">
            <Link
              href="/settings#integrations"
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-4">🔗</div>
                <div>
                  <div className="font-semibold text-gray-900">Optix</div>
                  <div className="text-sm text-gray-600">Cloud practice management</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>

            <Link
              href="/settings#integrations"
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-4">🔗</div>
                <div>
                  <div className="font-semibold text-gray-900">Acuitas (Ocuco)</div>
                  <div className="text-sm text-gray-600">Comprehensive optical software</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>

            <Link
              href="/settings#integrations"
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-4">🔗</div>
                <div>
                  <div className="font-semibold text-gray-900">Optisoft</div>
                  <div className="text-sm text-gray-600">UK optical management system</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>

            <Link
              href="/settings#integrations"
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-4">🔗</div>
                <div>
                  <div className="font-semibold text-gray-900">Sycle</div>
                  <div className="text-sm text-gray-600">Practice management & EHR</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-green-800">
                <strong>Automatic Sync:</strong> Once connected, patient data will sync automatically every night. New patients, updated phone numbers, and appointment history will be kept up to date.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📖 How to Upload Patients
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
            <h4 className="font-semibold text-gray-900 mb-2">Download Template</h4>
            <p className="text-sm text-gray-600">
              Click "Download CSV Template" above to get a pre-formatted file with example data
            </p>
          </div>

          <div>
            <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
            <h4 className="font-semibold text-gray-900 mb-2">Add Your Patients</h4>
            <p className="text-sm text-gray-600">
              Fill in your patient details. Mark high-risk patients (diabetic, glaucoma, myopia) in the risk_category column
            </p>
          </div>

          <div>
            <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
            <h4 className="font-semibold text-gray-900 mb-2">Upload & Start</h4>
            <p className="text-sm text-gray-600">
              Drag and drop your CSV file above, then launch your first recall campaign from the Calls page
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
