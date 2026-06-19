/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertColor, ExpiringDoc, Facility, CommercialRecord, EmployeeRecord, GovSubscription } from './types';

/**
 * Calculates the difference in days between target date and today.
 */
export function calculateDaysLeft(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  
  // Set times to midnight to calculate purely based on calendar days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Returns severity color based on remaining days:
 * - Red (🔴): days <= 0
 * - Yellow (🟡): 1 to 60 days
 * - Green (🟢): > 60 days
 */
export function getAlertColor(daysLeft: number): AlertColor {
  if (daysLeft <= 0) return 'red';
  if (daysLeft <= 60) return 'yellow';
  return 'green';
}

/**
 * Parses any file input and outputs Base64 content
 */
export function fileToBase64(file: File): Promise<{ name: string; type: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        data: reader.result as string,
      });
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Returns all documents that are nearing expiry or expired for the active facility
 */
export function getExpiringDocsForFacility(
  facility: Facility,
  crRecords: CommercialRecord[],
  employeeRecords: EmployeeRecord[],
  govSubs: GovSubscription[]
): ExpiringDoc[] {
  const result: ExpiringDoc[] = [];

  // 1. Process CRs and Licenses
  crRecords.forEach((cr) => {
    if (cr.facilityId === facility.id) {
      // Commercial registration expiry
      if (cr.crExpiryDate) {
        const days = calculateDaysLeft(cr.crExpiryDate);
        result.push({
          id: `${cr.id}-cr`,
          facilityId: facility.id,
          facilityName: facility.name,
          type: 'cr',
          title: `رقم السجل التجاري: ${cr.crNumber} (${cr.crName})`,
          expiryDate: cr.crExpiryDate,
          daysLeft: days,
          color: getAlertColor(days),
        });
      }

      // License expiry
      if (cr.licenseExpiryDate) {
        const days = calculateDaysLeft(cr.licenseExpiryDate);
        result.push({
          id: `${cr.id}-license`,
          facilityId: facility.id,
          facilityName: facility.name,
          type: 'license',
          title: `رخصة: ${cr.licenseName} (${cr.crName})`,
          expiryDate: cr.licenseExpiryDate,
          daysLeft: days,
          color: getAlertColor(days),
        });
      }
    }
  });

  // 2. Process Employees
  employeeRecords.forEach((emp) => {
    if (emp.facilityId === facility.id) {
      // Iqama
      if (emp.iqamaExpiryDate) {
        const days = calculateDaysLeft(emp.iqamaExpiryDate);
        result.push({
          id: `${emp.id}-iqama`,
          facilityId: facility.id,
          facilityName: facility.name,
          type: 'iqama',
          title: `إقامة العامل: ${emp.employeeName} (رقم: ${emp.iqamaNumber})`,
          expiryDate: emp.iqamaExpiryDate,
          daysLeft: days,
          color: getAlertColor(days),
        });
      }

      // Passport
      if (emp.passportExpiryDate) {
        const days = calculateDaysLeft(emp.passportExpiryDate);
        result.push({
          id: `${emp.id}-passport`,
          facilityId: facility.id,
          facilityName: facility.name,
          type: 'passport',
          title: `جواز سفر العامل: ${emp.employeeName} (رقم: ${emp.passportNumber})`,
          expiryDate: emp.passportExpiryDate,
          daysLeft: days,
          color: getAlertColor(days),
        });
      }

      // Health Card
      if (emp.healthCardExpiryDate) {
        const days = calculateDaysLeft(emp.healthCardExpiryDate);
        result.push({
          id: `${emp.id}-health`,
          facilityId: facility.id,
          facilityName: facility.name,
          type: 'health',
          title: `كرت صحي للعامل: ${emp.employeeName} (رقم: ${emp.healthCardNumber})`,
          expiryDate: emp.healthCardExpiryDate,
          daysLeft: days,
          color: getAlertColor(days),
        });
      }
    }
  });

  // 3. Process Subscriptions
  govSubs.forEach((sub) => {
    if (sub.facilityId === facility.id) {
      const days = calculateDaysLeft(sub.expiryDate);
      result.push({
        id: `${sub.id}-sub`,
        facilityId: facility.id,
        facilityName: facility.name,
        type: 'sub',
        title: `اشتراك منصة: ${sub.platformName} (${sub.ownerOrAffiliation})`,
        expiryDate: sub.expiryDate,
        daysLeft: days,
        color: getAlertColor(days),
      });
    }
  });

  // Sort by days remaining ascending (most urgent first)
  return result.sort((a, b) => a.daysLeft - b.daysLeft);
}

/**
 * Standard Ar Date Formatter
 */
export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
