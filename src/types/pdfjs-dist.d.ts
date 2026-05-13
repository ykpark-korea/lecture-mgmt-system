declare module "pdfjs-dist/build/pdf.mjs" {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export function getDocument(options: { url: string; withCredentials?: boolean }): {
    promise: Promise<unknown>;
  };
}
