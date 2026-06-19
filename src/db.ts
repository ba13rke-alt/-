/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Facility, CommercialRecord, EmployeeRecord, GovSubscription } from './types';

const DB_NAME = 'AlbaheraHR_DB';
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB failed to open');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Store 1: Facilities (المنشآت)
      if (!db.objectStoreNames.contains('facilities')) {
        db.createObjectStore('facilities', { keyPath: 'id' });
      }

      // Store 2: Commercial Records (السجلات والرخص)
      if (!db.objectStoreNames.contains('commercial_records')) {
        const store = db.createObjectStore('commercial_records', { keyPath: 'id' });
        store.createIndex('by_facility', 'facilityId', { unique: false });
      }

      // Store 3: Employee Records (العمالة والإقامات)
      if (!db.objectStoreNames.contains('employee_records')) {
        const store = db.createObjectStore('employee_records', { keyPath: 'id' });
        store.createIndex('by_facility', 'facilityId', { unique: false });
      }

      // Store 4: Gov Subscriptions (الاشتراكات الحكومية)
      if (!db.objectStoreNames.contains('gov_subscriptions')) {
        const store = db.createObjectStore('gov_subscriptions', { keyPath: 'id' });
        store.createIndex('by_facility', 'facilityId', { unique: false });
      }
    };
  });
}

// Global generic functions
function getStoreData<T>(storeName: string): Promise<T[]> {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function putStoreData<T>(storeName: string, data: T): Promise<void> {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

function deleteStoreData(storeName: string, id: string): Promise<void> {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// ------------------- FACILITIES -------------------
export function getFacilities(): Promise<Facility[]> {
  return getStoreData<Facility>('facilities');
}

export function saveFacility(facility: Facility): Promise<void> {
  return putStoreData('facilities', facility);
}

export function removeFacility(id: string): Promise<void> {
  return deleteStoreData('facilities', id).then(() => {
    // Cascading delete - clean up all related documents from other stores
    return Promise.all([
      getCommercialRecords(id).then(records => 
        Promise.all(records.map(r => deleteStoreData('commercial_records', r.id)))
      ),
      getEmployeeRecords(id).then(records => 
        Promise.all(records.map(e => deleteStoreData('employee_records', e.id)))
      ),
      getGovSubscriptions(id).then(records => 
        Promise.all(records.map(s => deleteStoreData('gov_subscriptions', s.id)))
      )
    ]).then(() => {});
  });
}

// ------------------- COMMERCIAL RECORDS & LICENSES -------------------
export function getCommercialRecords(facilityId?: string): Promise<CommercialRecord[]> {
  return getStoreData<CommercialRecord>('commercial_records').then((records) => {
    if (facilityId) {
      return records.filter((r) => r.facilityId === facilityId);
    }
    return records;
  });
}

export function saveCommercialRecord(record: CommercialRecord): Promise<void> {
  return putStoreData('commercial_records', record);
}

export function removeCommercialRecord(id: string): Promise<void> {
  return deleteStoreData('commercial_records', id);
}

// ------------------- EMPLOYEE RECORDS & FILE -------------------
export function getEmployeeRecords(facilityId?: string): Promise<EmployeeRecord[]> {
  return getStoreData<EmployeeRecord>('employee_records').then((records) => {
    if (facilityId) {
      return records.filter((r) => r.facilityId === facilityId);
    }
    return records;
  });
}

export function saveEmployeeRecord(record: EmployeeRecord): Promise<void> {
  return putStoreData('employee_records', record);
}

export function removeEmployeeRecord(id: string): Promise<void> {
  return deleteStoreData('employee_records', id);
}

// ------------------- GOV SUBSCRIPTIONS -------------------
export function getGovSubscriptions(facilityId?: string): Promise<GovSubscription[]> {
  return getStoreData<GovSubscription>('gov_subscriptions').then((records) => {
    if (facilityId) {
      return records.filter((r) => r.facilityId === facilityId);
    }
    return records;
  });
}

export function saveGovSubscription(record: GovSubscription): Promise<void> {
  return putStoreData('gov_subscriptions', record);
}

export function removeGovSubscription(id: string): Promise<void> {
  return deleteStoreData('gov_subscriptions', id);
}

// ------------------- BACKUP & RESTORE -------------------
export interface FullBackup {
  version: number;
  appName: string;
  backupDate: string;
  facilities: Facility[];
  commercialRecords: CommercialRecord[];
  employeeRecords: EmployeeRecord[];
  govSubscriptions: GovSubscription[];
}

export function exportFullBackup(): Promise<FullBackup> {
  return Promise.all([
    getFacilities(),
    getCommercialRecords(),
    getEmployeeRecords(),
    getGovSubscriptions()
  ]).then(([facilities, commercialRecords, employeeRecords, govSubscriptions]) => {
    return {
      version: DB_VERSION,
      appName: 'AlbaheraHR',
      backupDate: new Date().toISOString(),
      facilities,
      commercialRecords,
      employeeRecords,
      govSubscriptions
    };
  });
}

export function importFullBackup(backup: FullBackup): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      // Clear and rewrite everything
      const transaction = db.transaction(
        ['facilities', 'commercial_records', 'employee_records', 'gov_subscriptions'],
        'readwrite'
      );

      transaction.onerror = (e) => reject((e.target as any).error);
      transaction.oncomplete = () => resolve();

      // Clear all stores
      transaction.objectStore('facilities').clear();
      transaction.objectStore('commercial_records').clear();
      transaction.objectStore('employee_records').clear();
      transaction.objectStore('gov_subscriptions').clear();

      // Put new data
      backup.facilities.forEach((f) => transaction.objectStore('facilities').add(f));
      backup.commercialRecords.forEach((cr) => transaction.objectStore('commercial_records').add(cr));
      backup.employeeRecords.forEach((e) => transaction.objectStore('employee_records').add(e));
      backup.govSubscriptions.forEach((s) => transaction.objectStore('gov_subscriptions').add(s));
    });
  });
}

// Seeds default dummy facilities if empty
export function seedDefaultDataIfEmpty(): Promise<boolean> {
  return getFacilities().then((facilities) => {
    if (facilities.length === 0) {
      const defaultFacilities: Facility[] = [
        { id: 'f1', name: 'مؤسسة عبد العزيز محمد الحسني', createdAt: new Date().toISOString() },
        { id: 'f2', name: 'شركة محمد الحسني للخدمات والتجارة', createdAt: new Date().toISOString() },
        { id: 'f3', name: 'منشأة فوزية قطب المحدودة', createdAt: new Date().toISOString() }
      ];

      const savePromises = defaultFacilities.map((f) => saveFacility(f));
      
      // Let's seed some samples
      return Promise.all(savePromises).then(() => {
        // Add sample CR for f1 (Abd Alaziz)
        const sampleCR: CommercialRecord = {
          id: 'cr1',
          facilityId: 'f1',
          crNumber: '4030123456',
          crName: 'المكتب الرئيسي - جدة',
          crExpiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days left (Yellow)
          licenseName: 'رخصة بلدي للأنشطة التجارية',
          licenseExpiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days expired (Red)
          createdAt: new Date().toISOString()
        };

        // Add sample employee for f1
        const sampleEmployee: EmployeeRecord = {
          id: 'e1',
          facilityId: 'f1',
          employeeName: 'أحمد محمود عبدالرحمن',
          iqamaNumber: '2411987654',
          iqamaExpiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ~120 days left (Green)
          passportNumber: 'A1239876',
          passportExpiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days expired (Red)
          healthCardNumber: 'HC-99221',
          healthCardExpiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days left (Yellow)
          createdAt: new Date().toISOString()
        };

        // Add sample gov subscription for f1
        const sampleSub: GovSubscription = {
          id: 'sub1',
          facilityId: 'f1',
          platformName: 'منصة قوى (Qiwa)',
          ownerOrAffiliation: 'المالك (عبد العزيز الحسني)',
          expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Green
          createdAt: new Date().toISOString()
        };

        return Promise.all([
          saveCommercialRecord(sampleCR),
          saveEmployeeRecord(sampleEmployee),
          saveGovSubscription(sampleSub)
        ]).then(() => true);
      });
    }
    return false;
  });
}
