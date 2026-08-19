import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "lord-icon": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        trigger?: string;
        colors?: string;
        stroke?: string;
        speed?: string | number;
        state?: string;
        target?: string;
        loading?: string;
      };
    }
  }
}
