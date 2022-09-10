export declare type htmlVariant = "tags" | "html2" | "iso" | "html5";
export declare const h1: (line: string) => string;
export declare const extractTitle: (text: string) => [string, string];
export declare const linkIt: (text: string) => string;
export declare const html: (text: string, variant: htmlVariant) => string;
export declare const htm: (text: string) => string;
