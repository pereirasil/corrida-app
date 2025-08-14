import { useRef, useEffect } from 'react';

interface Resource {
  id: string;
  type: 'gps' | 'music' | 'audio' | 'location';
  priority: number; // 1 = mais alta, 5 = mais baixa
  isActive: boolean;
  startTime: number;
}

class ResourceManager {
  private static instance: ResourceManager;
  private resources: Map<string, Resource> = new Map();
  private conflicts: Map<string, string[]> = new Map();

  private constructor() {
    // Definir conflitos conhecidos
    this.conflicts.set('gps', ['audio', 'music']);
    this.conflicts.set('music', ['gps']);
    this.conflicts.set('audio', ['gps']);
    this.conflicts.set('location', ['audio']);
  }

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  // Registrar um recurso
  registerResource(id: string, type: Resource['type'], priority: number): boolean {
    // Verificar se há conflitos
    const conflictingResources = this.getConflictingResources(type);
    
    if (conflictingResources.length > 0) {
      // Se há conflitos, verificar prioridades
      const canTakeOver = this.canTakeOverResource(id, priority, conflictingResources);
      
      if (!canTakeOver) {
        console.warn(`Recurso ${id} não pode ser ativado devido a conflitos com recursos de maior prioridade`);
        return false;
      }
      
      // Desativar recursos conflitantes de menor prioridade
      conflictingResources.forEach(conflictId => {
        const conflict = this.resources.get(conflictId);
        if (conflict && conflict.priority > priority) {
          this.deactivateResource(conflictId);
        }
      });
    }

    // Registrar o novo recurso
    this.resources.set(id, {
      id,
      type,
      priority,
      isActive: true,
      startTime: Date.now(),
    });

    console.log(`Recurso ${id} (${type}) registrado com prioridade ${priority}`);
    return true;
  }

  // Desativar um recurso
  deactivateResource(id: string): boolean {
    const resource = this.resources.get(id);
    if (resource) {
      resource.isActive = false;
      this.resources.delete(id);
      console.log(`Recurso ${id} desativado`);
      return true;
    }
    return false;
  }

  // Verificar se um recurso pode ser ativado
  canActivateResource(type: Resource['type'], priority: number): boolean {
    const conflictingResources = this.getConflictingResources(type);
    
    if (conflictingResources.length === 0) {
      return true;
    }

    // Verificar se todos os recursos conflitantes têm prioridade menor
    return conflictingResources.every(conflictId => {
      const conflict = this.resources.get(conflictId);
      return !conflict || conflict.priority > priority;
    });
  }

  // Obter recursos conflitantes
  private getConflictingResources(type: Resource['type']): string[] {
    const conflictTypes = this.conflicts.get(type) || [];
    const conflictingIds: string[] = [];

    this.resources.forEach((resource, id) => {
      if (resource.isActive && conflictTypes.includes(resource.type)) {
        conflictingIds.push(id);
      }
    });

    return conflictingIds;
  }

  // Verificar se pode assumir recursos conflitantes
  private canTakeOverResource(id: string, priority: number, conflictingResources: string[]): boolean {
    return conflictingResources.every(conflictId => {
      const conflict = this.resources.get(conflictId);
      return !conflict || conflict.priority > priority;
    });
  }

  // Obter status de todos os recursos
  getResourcesStatus(): Resource[] {
    return Array.from(this.resources.values());
  }

  // Verificar se há conflitos ativos
  hasActiveConflicts(): boolean {
    let hasConflicts = false;
    
    this.resources.forEach((resource, id) => {
      if (resource.isActive) {
        const conflictingResources = this.getConflictingResources(resource.type);
        if (conflictingResources.length > 0) {
          hasConflicts = true;
          console.warn(`Conflito detectado: ${id} (${resource.type}) conflita com ${conflictingResources.join(', ')}`);
        }
      }
    });

    return hasConflicts;
  }

  // Limpar todos os recursos
  clearAllResources(): void {
    this.resources.clear();
    console.log('Todos os recursos foram limpos');
  }
}

// Hook para usar o gerenciador de recursos
export const useResourceManager = () => {
  const resourceManager = useRef(ResourceManager.getInstance());

  useEffect(() => {
    return () => {
      // Cleanup ao desmontar
      resourceManager.current.clearAllResources();
    };
  }, []);

  return resourceManager.current;
};

// Prioridades predefinidas
export const RESOURCE_PRIORITIES = {
  GPS_TRACKING: 1,      // GPS de corrida (mais alta)
  LOCATION_SERVICES: 2, // Serviços de localização
  MUSIC_PLAYBACK: 3,    // Reprodução de música
  AUDIO_PROCESSING: 4,  // Processamento de áudio
  BACKGROUND_TASKS: 5,  // Tarefas em segundo plano
} as const;

export default ResourceManager;
