"use client";

import { useOvertimeWorkspace } from '@/hooks/useOvertimeWorkspace';
import UploadHeroBanner from '@/components/overtime/UploadHeroBanner';
import DynamicConfigPanel from '@/components/overtime/DynamicConfigPanel';
import PrintableA4Report from '@/components/overtime/PrintableA4Report';
import ManualPasteModal from '@/components/overtime/ManualPasteModal';

export default function FpcOvertimeDashboardPage() {
  const workspace = useOvertimeWorkspace();

  return (
    <div className="space-y-6 pb-12">
      <UploadHeroBanner
        companyName={workspace.companyName}
        fileInputRef={workspace.fileInputRef}
        fileName={workspace.fileName}
        uploadedSheets={workspace.uploadedSheets}
        savedEmployees={workspace.savedEmployees}
        onFileUpload={workspace.handleFileUpload}
        onClearSheet={workspace.handleClearSheet}
        onOpenManualPaste={() => workspace.setIsManualModalOpen(true)}
        onExportPdf={workspace.handleExportPdf}
        isExportingPdf={workspace.isExportingPdf}
        onSelectUploadedEmployee={workspace.handleSelectUploadedEmployee}
        onSelectSavedProfile={workspace.handleSelectSavedProfile}
      />

      <DynamicConfigPanel
        companyName={workspace.companyName}
        setCompanyName={workspace.setCompanyName}
        employeeName={workspace.employeeName}
        setEmployeeName={workspace.setEmployeeName}
        employeeId={workspace.employeeId}
        setEmployeeId={workspace.setEmployeeId}
        designation={workspace.designation}
        setDesignation={workspace.setDesignation}
        month={workspace.month}
        onMonthChange={workspace.handleMonthChange}
        dutyHours={workspace.dutyHours}
        setDutyHours={workspace.setDutyHours}
        dutyMinutes={workspace.dutyMinutes}
        setDutyMinutes={workspace.setDutyMinutes}
        standardDutyMinutes={workspace.standardDutyMinutes}
        hourlyRate={workspace.hourlyRate}
        setHourlyRate={workspace.setHourlyRate}
        summary={workspace.summary}
        allShortDaysMinusEnabled={workspace.allShortDaysMinusEnabled}
        onToggleAllShortMinus={workspace.handleToggleAllShortMinus}
        onSaveEmployeeToLocal={workspace.handleSaveEmployeeToLocal}
      />

      <PrintableA4Report
        companyName={workspace.companyName}
        formattedMonthLabel={workspace.formattedMonthLabel}
        dutyHours={workspace.dutyHours}
        dutyMinutes={workspace.dutyMinutes}
        hourlyRate={workspace.hourlyRate}
        employeeName={workspace.employeeName}
        employeeId={workspace.employeeId}
        designation={workspace.designation}
        cardNo={workspace.cardNo}
        summary={workspace.summary}
        calculatedRows={workspace.calculatedRows}
        editingRowDay={workspace.editingRowDay}
        onToggleEditRow={workspace.handleToggleEditRow}
        onRowChange={workspace.handleRowChange}
        onToggleRowMinus={workspace.handleToggleRowMinus}
        onToggleOffDay={workspace.handleToggleOffDay}
      />

      {/* Manual Paste Modal */}
      <ManualPasteModal
        isOpen={workspace.isManualModalOpen}
        onClose={() => workspace.setIsManualModalOpen(false)}
        onApplyManualData={workspace.handleApplyManualData}
        initialId={workspace.employeeId}
        initialName={workspace.employeeName}
        initialDesignation={workspace.designation}
        initialCardNo={workspace.cardNo}
      />
    </div>
  );
}
