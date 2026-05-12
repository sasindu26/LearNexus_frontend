import api from '@/lib/api';

export interface ModuleTopic {
  id: string;
  name: string;
  title: string;
  description: string;
  isCompleted: boolean;
  subtopics: ModuleTopic[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  progress: number;
  icon: string;
}

export const getModuleTopics = async (moduleName: string): Promise<ModuleTopic[]> => {
  try {
    const response = await api.post(
      `/module-content/${encodeURIComponent(moduleName)}/topics`,
      { moduleName }
    );

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching module topics:', error);
    return [];
  }
};

export const updateTopicCompletion = async (
  topicId: string,
  isCompleted: boolean
): Promise<boolean> => {
  try {
    const response = await api.put(
      `/topics/${topicId}/completion`,
      { isCompleted }
    );
    return response.status === 200;
  } catch (error) {
    console.error('Error updating topic completion:', error);
    return false;
  }
};

export const startModuleLearning = async (moduleData: {
  moduleId: string;
  moduleName: string;
  moduleDescription: string;
}): Promise<any> => {
  try {
    if (!moduleData || !moduleData.moduleName) {
      throw new Error('Invalid module data');
    }

    const encodedModuleName = encodeURIComponent(moduleData.moduleName);

    const response = await api.post(
      `/module-content/${encodedModuleName}/topics`,
      moduleData
    );

    return response.data;
  } catch (error: any) {
    console.error('Error in startModuleLearning:', error);
    return {};
  }
};
