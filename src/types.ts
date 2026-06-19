/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Attachment {
  name: string;
  type: string; // e.g. 'image/png', 'application/pdf', 'image/jpeg'
  data: string; // base64 URL or data
}

export interface Facility {
  id: string;
  name: string;
  createdAt: string;
}

// أ- جدول السجلات والرخص التجارية
export interface CommercialRecord {
  id: string;
  facilityId: string; // ربط بالمنشأة
  crNumber: string; // رقم السجل التجاري
  crName: string; // اسم السجل
  crExpiryDate: string; // تاريخ انتهاء السجل
  crAttachment?: Attachment; // مرفق السجل
  licenseName: string; // اسم الرخصة (مثل بلدي، دفاع مدني)
  licenseExpiryDate: string; // تاريخ انتهاء الرخصة
  licenseAttachment?: Attachment; // مرفق الرخصة
  createdAt: string;
}

// ب- جدول إقامات وملفات العمالة
export interface EmployeeRecord {
  id: string;
  facilityId: string; // ربط بالمنشأة
  employeeName: string; // اسم العامل
  iqamaNumber: string; // رقم الإقامة
  iqamaExpiryDate: string; // تاريخ انتهاء الإقامة
  iqamaAttachment?: Attachment; // صورة إقامة العامل
  passportNumber: string; // رقم الجواز
  passportExpiryDate: string; // تاريخ انتهاء الجواز
  passportAttachment?: Attachment; // صورة جواز السفر
  healthCardNumber: string; // رقم الكرت الصحي
  healthCardExpiryDate: string; // تاريخ انتهاء الكرت الصحي
  healthCardAttachment?: Attachment; // صورة الكرت الصحي
  createdAt: string;
}

// ج- جدول الاشتراكات الحكومية
export interface GovSubscription {
  id: string;
  facilityId: string; // ربط بالمنشأة
  platformName: string; // اسم المنصة (مثل أبشر أعمال، قوى، التأمينات)
  ownerOrAffiliation: string; // المالك / التابع
  expiryDate: string; // تاريخ انتهاء الاشتراك
  attachment?: Attachment; // مرفق الاشتراك
  createdAt: string;
}

export type AlertColor = 'red' | 'yellow' | 'green';

export interface ExpiringDoc {
  id: string;
  facilityId: string;
  facilityName: string;
  type: 'cr' | 'license' | 'iqama' | 'passport' | 'health' | 'sub';
  title: string; // e.g. "سجل تجاري: مؤسسة عبد العزيز" or "إقامة العامل: أحمد علي"
  expiryDate: string;
  daysLeft: number;
  color: AlertColor;
}
