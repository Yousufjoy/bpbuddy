import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform, Alert } from 'react-native';
import { BloodPressureReading } from '../types/reading';
import { classifyBloodPressure, formatReadingDateTime } from '../utils/bpClassification';

export interface ReportStats {
  totalReadings: number;
  avgSystolic: number;
  avgDiastolic: number;
  avgPulse: number | null;
  highestReading: BloodPressureReading | null;
  lowestReading: BloodPressureReading | null;
  periodLabel: string;
}

export function calculateReportStats(readings: BloodPressureReading[], periodLabel: string): ReportStats {
  if (readings.length === 0) {
    return {
      totalReadings: 0,
      avgSystolic: 0,
      avgDiastolic: 0,
      avgPulse: null,
      highestReading: null,
      lowestReading: null,
      periodLabel,
    };
  }

  let totalSys = 0;
  let totalDia = 0;
  let totalPulse = 0;
  let pulseCount = 0;

  let highest = readings[0];
  let lowest = readings[0];

  for (const r of readings) {
    totalSys += r.systolic;
    totalDia += r.diastolic;
    if (r.pulse) {
      totalPulse += r.pulse;
      pulseCount++;
    }

    if (r.systolic > highest.systolic) {
      highest = r;
    }
    if (r.systolic < lowest.systolic) {
      lowest = r;
    }
  }

  return {
    totalReadings: readings.length,
    avgSystolic: Math.round(totalSys / readings.length),
    avgDiastolic: Math.round(totalDia / readings.length),
    avgPulse: pulseCount > 0 ? Math.round(totalPulse / pulseCount) : null,
    highestReading: highest,
    lowestReading: lowest,
    periodLabel,
  };
}

export async function generateAndSharePdfReport(
  readings: BloodPressureReading[],
  stats: ReportStats,
  mode: 'share' | 'download' = 'share'
): Promise<void> {
  const tableRows = readings
    .map((r) => {
      const classification = classifyBloodPressure(r.systolic, r.diastolic);
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #10264D;">
            ${formatReadingDateTime(r.measuredAt)}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 14px; font-weight: 700; color: #10264D;">
            ${r.systolic} / ${r.diastolic} <span style="font-size: 11px; font-weight: normal; color: #64748B;">mmHg</span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #10264D;">
            ${r.pulse ? `${r.pulse} bpm` : '—'}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">
            <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; color: ${classification.color}; background-color: ${classification.bgColor};">
              ${classification.badgeLabel}
            </span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">
            ${r.notes || '—'}
          </td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>BP Buddy Health Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #10264D;
            margin: 0;
            padding: 36px;
            background-color: #FFFFFF;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #EAF4FF;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            color: #1677F2;
            margin: 0;
          }
          .subtitle {
            font-size: 13px;
            color: #5A6F8F;
            margin-top: 4px;
          }
          .meta {
            text-align: right;
            font-size: 12px;
            color: #64748B;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-bottom: 30px;
          }
          .stat-card {
            background-color: #F8FAFD;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 16px;
            text-align: center;
          }
          .stat-label {
            font-size: 12px;
            color: #5A6F8F;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 6px;
          }
          .stat-value {
            font-size: 22px;
            font-weight: 800;
            color: #10264D;
          }
          .stat-unit {
            font-size: 11px;
            font-weight: normal;
            color: #64748B;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #10264D;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #F1F5F9;
            text-align: left;
            padding: 10px;
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
          }
          .disclaimer {
            margin-top: 40px;
            padding: 14px;
            background-color: #F8FAFD;
            border-left: 4px solid #1677F2;
            border-radius: 4px;
            font-size: 11px;
            color: #64748B;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <div>
              <h1 class="title">BP Buddy</h1>
              <div class="subtitle">Personal Blood Pressure & Health Report</div>
            </div>
          </div>
          <div class="meta">
            <div><strong>Period:</strong> ${stats.periodLabel}</div>
            <div><strong>Exported:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="section-title">Summary Statistics</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Readings</div>
            <div class="stat-value">${stats.totalReadings}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Average BP</div>
            <div class="stat-value" style="color: #1677F2;">${stats.avgSystolic} / ${stats.avgDiastolic} <span class="stat-unit">mmHg</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Average Pulse</div>
            <div class="stat-value" style="color: #EF4444;">${stats.avgPulse ? stats.avgPulse : '—'} <span class="stat-unit">bpm</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Highest / Lowest</div>
            <div class="stat-value" style="font-size: 16px; line-height: 1.4;">
              ↑ ${stats.highestReading ? `${stats.highestReading.systolic}/${stats.highestReading.diastolic}` : '—'}<br/>
              ↓ ${stats.lowestReading ? `${stats.lowestReading.systolic}/${stats.lowestReading.diastolic}` : '—'}
            </div>
          </div>
        </div>

        <div class="section-title">Detailed Measurement Log</div>
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Blood Pressure</th>
              <th>Pulse</th>
              <th>Category</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="5" style="text-align: center; padding: 20px;">No readings recorded for this period.</td></tr>'}
          </tbody>
        </table>

        <div class="disclaimer">
          <strong>Medical Disclaimer:</strong> BP Buddy is an educational logging and tracking tool. This report is for personal reference and informational sharing with your licensed healthcare provider. A single measurement or average does not establish a medical condition. Do not alter prescribed medication or therapy without direct clinical supervision.
        </div>
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    if (mode === 'download') {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BP_Buddy_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    } else {
      alert('Please allow popups to print/export the report.');
    }
    return;
  }

  try {
    const { uri, base64 } = await Print.printToFileAsync({ html: htmlContent, base64: true });
    let safePath = uri;

    try {
      if (FileSystem.cacheDirectory) {
        safePath = `${FileSystem.cacheDirectory}bp_report_${Date.now()}.pdf`;
        if (base64) {
          await FileSystem.writeAsStringAsync(safePath, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else if (uri) {
          await FileSystem.copyAsync({ from: uri, to: safePath });
        }
      }
    } catch (fileErr) {
      console.log('Sandbox copy failed, attempting with direct URI:', fileErr);
    }

    if (mode === 'download') {
      if (Platform.OS === 'android' && (FileSystem as any).StorageAccessFramework) {
        try {
          const permissions = await (FileSystem as any).StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const fileName = `BP_Buddy_Report_${new Date().toISOString().split('T')[0]}`;
            const fileUri = await (FileSystem as any).StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              'application/pdf'
            );
            if (base64) {
              await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
              });
            } else {
              const fileContent = await FileSystem.readAsStringAsync(safePath, {
                encoding: FileSystem.EncodingType.Base64,
              });
              await FileSystem.writeAsStringAsync(fileUri, fileContent, {
                encoding: FileSystem.EncodingType.Base64,
              });
            }
            Alert.alert(
              'Download Complete',
              'Your clinical report was saved directly to your selected device folder.'
            );
            return;
          }
        } catch (safErr) {
          console.warn('StorageAccessFramework failed, falling back to share sheet:', safErr);
        }
      }

      // iOS or fallback for download: use Save to Files via system share sheet
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(safePath, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Save Report to Files or Downloads',
        });
      } else {
        Alert.alert('Report Ready', `PDF report generated at: ${safePath}`);
      }
      return;
    }

    // Share mode
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(safePath, {
        UTI: 'com.adobe.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Share Blood Pressure Report',
      });
    } else {
      Alert.alert('Report Ready', `PDF report saved at: ${safePath}`);
    }
  } catch (error) {
    console.error('Failed to generate or share PDF:', error);
    throw error;
  }
}

export async function downloadPdfReport(
  readings: BloodPressureReading[],
  stats: ReportStats
): Promise<void> {
  return generateAndSharePdfReport(readings, stats, 'download');
}

export async function sharePdfReport(
  readings: BloodPressureReading[],
  stats: ReportStats
): Promise<void> {
  return generateAndSharePdfReport(readings, stats, 'share');
}
