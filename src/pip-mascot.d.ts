import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pip-mascot': React.HTMLAttributes<HTMLElement> & {
        pose?: 'wave' | 'think' | 'point' | 'celebrate' | 'sleep' | 'oops';
        size?: number | string;
        speed?: number | string;
        autocycle?: number | string;
        'no-shadow'?: boolean | '';
      };
    }
  }
}
