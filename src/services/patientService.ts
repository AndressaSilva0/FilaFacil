import { api } from './api';
import type { Patient } from '../types';

export interface SearchPatientResult {
  id: string;
  name: string;
  cpf: string;
  susCard: string;
  birthDate?: string;
  phone?: string;
  specialCondition?: string;
}

class PatientService {
  public async search(query: string): Promise<SearchPatientResult[]> {
    if (!query || query.trim().length < 2) return [];

    const response = await api.get<{ results: SearchPatientResult[]; total: number }>('/patients/search', {
      q: query.trim(),
    });

    return response.results || [];
  }

  public async create(data: {
    name: string;
    cpf?: string;
    cartaoSus?: string;
    susCard?: string;
    birthDate?: string;
    phone?: string;
    specialCondition?: string;
  }): Promise<Patient> {
    const response = await api.post<{ message: string; patient: any }>('/patients', data);
    return this.mapPatient(response.patient);
  }

  public async update(id: string, data: Partial<Patient>): Promise<Patient> {
    const response = await api.put<{ message: string; patient: any }>(`/patients/${id}`, data);
    return this.mapPatient(response.patient);
  }

  private mapPatient(p: any): Patient {
    return {
      id: p.id,
      name: p.name,
      cpf: p.cpf,
      cartaoSus: p.susCard || p.cartaoSus || '',
      birthDate: p.birthDate,
      phone: p.phone,
      priorityLabel: p.specialCondition || undefined,
    };
  }
}

export const patientService = new PatientService();

