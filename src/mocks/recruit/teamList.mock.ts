import { Team } from "@/types/recruit";

export const teams: Team[] = [
    {
      id: 1,
      name: 'DevNinjas',
      description: '웹 개발 전문 팀입니다. 다양한 프로젝트 경험이 있습니다.웹 개발 전문 팀입니다. 다양한 프로젝트 경험이 있습니다.웹 개발 전문 팀입니다. 다양한 프로젝트 경험이 있습니다.웹 개발 전문 팀입니다. 다양한 프로젝트 경험이 있습니다.웹 개발 전문 팀입니다. 다양한 프로젝트 경험이 있습니다.웹 개발 전문 팀입니다. 다양한 프로젝트 경험이 있습니다.',
      tags: ['React', 'Node.js', 'AWS'],
      memberCount: 8,
      projectCount: 12,
      createdAt: '2023-01-15',
      isRecruiting: true
    },
    {
      id: 2,
      name: 'AI Innovators',
      description: '인공지능과 머신러닝에 특화된 팀입니다.',
      tags: ['Python', 'TensorFlow', 'PyTorch'],
      memberCount: 6,
      projectCount: 8,
      createdAt: '2023-03-20',
      isRecruiting: false
    },
    {
      id: 3,
      name: 'Mobile Masters',
      description: '모바일 앱 개발 전문 팀입니다.',
      tags: ['Flutter', 'React Native', 'Swift'],
      memberCount: 5,
      projectCount: 10,
      createdAt: '2023-05-10',
      isRecruiting: true
    },
    {
      id: 4,
      name: 'Cloud Architects',
      description: '클라우드 인프라와 DevOps에 강점이 있는 팀입니다.',
      tags: ['AWS', 'Docker', 'Kubernetes'],
      memberCount: 7,
      projectCount: 15,
      createdAt: '2023-02-28',
      isRecruiting: false
    },
    {
      id: 5,
      name: 'Design & Dev',
      description: '디자인과 개발을 함께하는 크리에이티브 팀입니다.',
      tags: ['Figma', 'React', 'Animation'],
      memberCount: 9,
      projectCount: 20,
      createdAt: '2023-04-05',
      isRecruiting: true
    }
  ];
