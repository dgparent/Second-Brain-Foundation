/**
 * Type declarations for modules without TypeScript support
 */

declare module 'cheerio' {
  export interface Cheerio<T> {
    text(): string;
    html(): string | null;
    attr(name: string): string | undefined;
    attr(name: string, value: string): Cheerio<T>;
    find(selector: string): Cheerio<T>;
    each(fn: (index: number, element: any) => void): Cheerio<T>;
    first(): Cheerio<T>;
    remove(): Cheerio<T>;
    length: number;
    [index: number]: T;
  }

  export interface CheerioAPI {
    (selector: string): Cheerio<any>;
    html(): string;
    text(): string;
  }

  export function load(html: string, options?: any): CheerioAPI;
}

declare module 'html-to-text' {
  export interface HtmlToTextOptions {
    wordwrap?: number | false | null;
    preserveNewlines?: boolean;
    selectors?: Array<{
      selector: string;
      format?: string;
      options?: any;
    }>;
    formatters?: { [key: string]: (elem: any, walk: any, builder: any, formatOptions: any) => void };
    limits?: {
      maxInputLength?: number;
      maxBaseElements?: number;
      maxChildNodes?: number;
      ellipsis?: string;
    };
    baseElements?: {
      selectors?: string[];
      returnDomByDefault?: boolean;
    };
    longWordSplit?: {
      forceWrapOnLimit?: boolean;
      wrapCharacters?: string[];
    };
    whitespaceCharacters?: string;
    decodeEntities?: boolean;
  }

  export function convert(html: string, options?: HtmlToTextOptions): string;
}

declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
    [key: string]: any;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: any;
    text: string;
    version: string;
  }

  interface PDFOptions {
    pagerender?: (pageData: any) => string;
    max?: number;
    version?: string;
  }

  function pdfParse(buffer: Buffer, options?: PDFOptions): Promise<PDFData>;
  export default pdfParse;
}

declare module 'form-data' {
  import { Readable } from 'stream';

  interface FormDataAppendOptions {
    header?: string | { [key: string]: string };
    knownLength?: number;
    filename?: string;
    filepath?: string;
    contentType?: string;
  }

  class FormData {
    append(key: string, value: any, options?: FormDataAppendOptions | string): void;
    getHeaders(): { [key: string]: string };
    getBoundary(): string;
    getBuffer(): Buffer;
    getLength(callback: (err: Error | null, length: number) => void): void;
    getLengthSync(): number;
    hasKnownLength(): boolean;
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean }): T;
    submit(
      params: string | object,
      callback?: (err: Error | null, res: any) => void
    ): any;
  }

  export = FormData;
}
