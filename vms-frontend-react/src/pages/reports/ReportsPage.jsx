import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [generating, setGenerating] = useState({
    vehicle: false,
    expense: false,
    expenseExcel: false,
    maintenance: false,
    maintenanceExcel: false,
    income: false
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const downloadPdf = async (url, filename, reportType) => {
    try {
      setGenerating({ ...generating, [reportType]: true });
      
      const response = await api.get(url, {
        responseType: 'blob'
      });

      // Create blob link to download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.response?.data?.message || 'Failed to download report');
    } finally {
      setGenerating({ ...generating, [reportType]: false });
    }
  };

  const downloadWithPost = async (url, data, filename, reportType, fileType = 'pdf') => {
    try {
      setGenerating({ ...generating, [reportType]: true });
      
      const response = await api.post(url, data, {
        responseType: 'blob'
      });

      // Determine MIME type based on file extension
      const mimeType = fileType === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

      // Create blob link to download
      const blob = new Blob([response.data], { type: mimeType });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.response?.data?.message || 'Failed to download report');
    } finally {
      setGenerating({ ...generating, [reportType]: false });
    }
  };

  const handleVehicleReport = () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    const vehicle = vehicles.find(v => v.id === parseInt(selectedVehicle));
    downloadPdf(
      `/reports/vehicle/${selectedVehicle}/pdf`,
      `vehicle-report-${vehicle?.plate_number}.pdf`,
      'vehicle'
    );
  };

  const handleExpenseReport = () => {
    if (!dateRange.start_date || !dateRange.end_date) {
      toast.error('Please select date range');
      return;
    }

    downloadWithPost(
      '/reports/expenses/pdf',
      dateRange,
      `expense-report-${dateRange.start_date}-to-${dateRange.end_date}.pdf`,
      'expense',
      'pdf'
    );
  };

  const handleExpenseExcel = () => {
    if (!dateRange.start_date || !dateRange.end_date) {
      toast.error('Please select date range');
      return;
    }

    downloadWithPost(
      '/reports/expenses/excel',
      dateRange,
      `expense-report-${dateRange.start_date}-to-${dateRange.end_date}.xlsx`,
      'expenseExcel',
      'excel'
    );
  };

  const handleMaintenanceReport = () => {
    if (!dateRange.start_date || !dateRange.end_date) {
      toast.error('Please select date range');
      return;
    }

    downloadWithPost(
      '/reports/maintenance/pdf',
      dateRange,
      `maintenance-report-${dateRange.start_date}-to-${dateRange.end_date}.pdf`,
      'maintenance',
      'pdf'
    );
  };

  const handleMaintenanceExcel = () => {
    if (!dateRange.start_date || !dateRange.end_date) {
      toast.error('Please select date range');
      return;
    }

    downloadWithPost(
      '/reports/maintenance/excel',
      dateRange,
      `maintenance-report-${dateRange.start_date}-to-${dateRange.end_date}.xlsx`,
      'maintenanceExcel',
      'excel'
    );
  };

  const handleIncomeReport = () => {
    if (!dateRange.start_date || !dateRange.end_date) {
      toast.error('Please select date range');
      return;
    }

    downloadWithPost(
      '/reports/income/pdf',
      dateRange,
      `income-report-${dateRange.start_date}-to-${dateRange.end_date}.pdf`,
      'income',
      'pdf'
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Exports</h1>
        <p className="text-gray-600 mt-2">Generate and download comprehensive PDF reports & Excel exports</p>
      </div>

      {/* Quick Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Looking for Analytics?</h3>
            <p className="text-sm text-blue-800 mb-2">
              View interactive charts and real-time statistics on the Analytics Dashboard.
            </p>
            <Link to="/analytics" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Go to Analytics Dashboard →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vehicle Report Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Vehicle Report</h2>
              <p className="text-sm text-gray-600">Complete details, maintenance, expenses & trips</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vehicle
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="form-input"
              >
                <option value="">-- Choose a vehicle --</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number} - {vehicle.manufacturer} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleVehicleReport}
              disabled={!selectedVehicle || generating.vehicle}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {generating.vehicle ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500">
              Includes: Vehicle details, maintenance history, expense records, and recent trips
            </p>
          </div>
        </div>

        {/* Expense Report Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Expense Report</h2>
              <p className="text-sm text-gray-600">Summary by category with totals</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={dateRange.start_date}
                  onChange={handleDateChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={dateRange.end_date}
                  onChange={handleDateChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* PDF Button */}
            <button
              onClick={handleExpenseReport}
              disabled={generating.expense}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating.expense ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            {/* Excel Button */}
            <button
              onClick={handleExpenseExcel}
              disabled={generating.expenseExcel}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating.expenseExcel ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Excel Report</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500">
              📄 PDF: Formatted report | 📊 Excel: Editable spreadsheet with data
            </p>
          </div>
        </div>

        {/* Maintenance Report Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Maintenance Report</h2>
              <p className="text-sm text-gray-600">Status summary and cost breakdown</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={dateRange.start_date}
                  onChange={handleDateChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={dateRange.end_date}
                  onChange={handleDateChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* PDF Button */}
            <button
              onClick={handleMaintenanceReport}
              disabled={generating.maintenance}
              className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating.maintenance ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            {/* Excel Button */}
            <button
              onClick={handleMaintenanceExcel}
              disabled={generating.maintenanceExcel}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating.maintenanceExcel ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Excel Report</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500">
              📄 PDF: Formatted report | 📊 Excel: Editable spreadsheet with data
            </p>
          </div>
        </div>

        {/* Income Report Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Income Report</h2>
              <p className="text-sm text-gray-600">Revenue summary with trip details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={dateRange.start_date}
                  onChange={handleDateChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={dateRange.end_date}
                  onChange={handleDateChange}
                  className="form-input"
                />
              </div>
            </div>

            <button
              onClick={handleIncomeReport}
              disabled={generating.income}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating.income ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500">
              Includes: Total income, trip associations, and detailed records
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;