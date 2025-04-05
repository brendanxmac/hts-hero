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

const resizeObserverOptions = {};

const maxWidth = 800;

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDF({ file, isOpen, setIsOpen, title }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  //   const onResize = useCallback<ResizeObserverCallback>((entries) => {
  //     console.log("onResize", entries);
  //     const [entry] = entries;

  //     if (entry) {
  //       setContainerWidth(entry.contentRect.width);
  //     }
  //   }, []);

  //   useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }
  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" onClose={() => setIsOpen(false)}>
        <Transition.Child
          className="fixed inset-0 bg-slate-900 bg-opacity-30 z-50 transition-opacity"
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
          <Dialog.Panel className="bg-base-100 rounded shadow-md shadow-gray-500 overflow-auto max-w-6xl w-5/6 h-5/6">
            <div className="z-10 sticky top-0 px-5 py-4 bg-base-100 border-b border-base-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Dialog.Title className="font-semibold text-base-content">
                    {title}
                  </Dialog.Title>
                  <div className="mx-auto text-center">
                    <a
                      download
                      href={file}
                      className="btn btn-xs cursor-pointer text-white bg-primary hover:bg-primary/80 shrink-0"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-base-content hover:text-base-content/80"
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
            <div ref={setContainerRef} className="w-full h-full">
              {/* @ts-ignore */}
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from({ length: numPages }, (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    // scale={1.3}
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
