import 'next-auth';

// TODO: 새로운 인증 플로우에 맞게 타입 재정의 필요
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}
