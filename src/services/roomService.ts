import { api } from './api';
import type { Room } from '../types';

class RoomService {
  public async list(): Promise<Room[]> {
    const response = await api.get<{ rooms: any[] }>('/rooms');
    return (response.rooms || []).map((r) => ({
      id: r.id,
      name: r.name,
      label: r.label || r.name,
      defaultService: r.defaultService,
      assignedProfessional: r.assignedProfessional || undefined,
    }));
  }

  public async assign(roomId: string, professionalName: string): Promise<Room> {
    const response = await api.post<{ message: string; room: any }>(`/rooms/${roomId}/assign`, {
      professionalName,
    });
    const r = response.room;
    return {
      id: r.id,
      name: r.name,
      label: r.label || r.name,
      defaultService: r.defaultService,
      assignedProfessional: r.assignedProfessional || undefined,
    };
  }
}

export const roomService = new RoomService();

