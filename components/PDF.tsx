"use client";

import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useCallback, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Transition } from "@headlessui/react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface Props {
  file: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const resizeObserverOptions = {};
const maxWidth = 1000;

export default function PDF({ file, isOpen, setIsOpen, title }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [scale, setScale] = useState(1);
  const [pdfWidth, setPdfWidth] = useState<number>(0);

  // @ts-ignore
  const onResize = useCallback<ResizeObserverCallback>(
    (entries) => {
      const [entry] = entries;
      if (entry) {
        const newWidth = entry.contentRect.width;
        setContainerWidth(newWidth);
        // Calculate new scale when container width changes
        if (pdfWidth > 0) {
          const paddingFactor = 0.6;
          const newScale = (newWidth * paddingFactor) / pdfWidth;
          setScale(Math.min(Math.max(newScale, 1), 2)); // Keep between 100% and 200%
        }
      }
    },
    [pdfWidth]
  );

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  async function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): Promise<void> {
    setNumPages(nextNumPages);

    // Get the first page to determine PDF dimensions
    const firstPage = await pdfjs
      .getDocument(file)
      .promise.then((doc) => doc.getPage(1));
    const viewport = firstPage.getViewport({ scale: 1 });
    setPdfWidth(viewport.width);

    // Calculate initial scale to fit width
    if (containerWidth) {
      const paddingFactor = 0.6;
      const initialScale = (containerWidth * paddingFactor) / viewport.width;
      setScale(Math.min(Math.max(initialScale, 1), 2)); // Keep between 100% and 200%
    }
  }
  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" onClose={() => setIsOpen(false)}>
        <Transition.Child
          className="fixed inset-0 bg-slate-900 bg-opacity-70 z-50 transition-opacity"
          enter="transition ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-out duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          aria-hidden="true"
        />
        <Transition.Child
          className="fixed inset-0 z-50 overflow-hidden flex items-center my-4 justify-center px-4 sm:px-6"
          enter="transition ease-in-out duration-200"
          enterFrom="opacity-0 translate-y-4"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in-out duration-200"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-4"
        >
          <Dialog.Panel className="rounded border-2 border-base-100 overflow-auto max-w-7xl w-full h-full">
            <div className="bg-base-100 z-10 sticky top-0 p-2 sm:px-5 sm:py-4 sm:bg-base-300 border-b border-base-300 w-full">
              <div className="flex justify-between items-center max-w-full ">
                <div className="shrink-0 hidden sm:flex items-center gap-4">
                  <Dialog.Title className="font-semibold text-base-content dark:text-gray-100">
                    {title}
                  </Dialog.Title>

                  <div className="text-center">
                    <a
                      download
                      href={file}
                      className="btn btn-xs cursor-pointer focus:outline-none text-white bg-primary hover:bg-primary/80 shrink-0"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full gap-6">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setScale((prev) => Math.max(0.5, prev - 0.1))
                      }
                      className="btn btn-xs btn-ghost"
                      title="Zoom out"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="text-sm font-bold">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() =>
                        setScale((prev) => Math.min(2, prev + 0.1))
                      }
                      className="btn btn-xs btn-ghost"
                      title="Zoom in"
                    >
                      <svg
                        className="w-4 h-4 font-bold"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-base-content hover:text-base-content/80 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    <div className="sr-only">Close</div>
                    <svg className="w-4 h-4 fill-current">
                      <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div
              ref={setContainerRef}
              className="bg-base-100 w-full h-full overflow-auto"
            >
              {/* @ts-ignore */}
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from({ length: numPages }, (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={scale}
                    width={
                      containerWidth
                        ? Math.min(containerWidth, maxWidth)
                        : maxWidth
                    }
                  />
                ))}
              </Document>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
