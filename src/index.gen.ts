/* TypeScript file generated from index.res by genType. */
/* eslint-disable import/first */


// @ts-ignore: Implicit any on import
import * as Curry__Es6Import from 'rescript/lib/es6/curry.js';
const Curry: any = Curry__Es6Import;

// @ts-ignore: Implicit any on import
import * as indexBS__Es6Import from './index.bs';
const indexBS: any = indexBS__Es6Import;

// tslint:disable-next-line:interface-over-type-literal
export type htmlVariant = "tags" | "html2" | "iso" | "html5";

export const h1: (line:string) => string = indexBS.h1;

export const extractTitle: (text:string) => [string, string] = indexBS.extractTitle;

export const linkIt: (text:string) => string = indexBS.linkIt;

export const html: (text:string, variant:htmlVariant) => string = function (Arg1: any, Arg2: any) {
  const result = Curry._2(indexBS.html, Arg1, Arg2);
  return result
};

export const htm: (text:string) => string = indexBS.htm;
