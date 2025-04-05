"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface Props {
  title: string;
  isOpen: boolean;
  pdfURL: string | undefined;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ModalPDF({ title, isOpen, pdfURL, setIsOpen }: Props) {
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
          <Dialog.Panel className="bg-white dark:bg-slate-800 rounded shadow-lg overflow-auto max-w-6xl w-full h-5/6">
            {/* <div className="sticky bottom-0 px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <Dialog.Title className="font-semibold text-slate-800 dark:text-slate-100">
                  {title}
                </Dialog.Title>
                <button
                  type="button"
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400"
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
            </div> */}
            <PdfViewer url={pdfURL} />
            {/* <div className="sticky bottom-0 px-5 py-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700"> */}
            {/* <div className="mx-auto text-center">
                <a
                  download
                  href={pdfURL}
                  className="btn btn-xs cursor-pointer text-white bg-indigo-600 hover:bg-indigo-400 dark:bg-teal-600 dark:hover:bg-teal-400 shrink-0"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </div> */}
            {/* </div> */}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}

const PdfViewer = ({ url }: { url: string | undefined }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (url === undefined) {
    return <NoPdfAvailable />;
  }

  return (
    <div className="h-full w-full">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={url}
          plugins={[defaultLayoutPluginInstance]}
          withCredentials={true}
        />
      </Worker>
    </div>
  );
};

const NoPdfAvailable: React.FC = () => {
  return (
    <div className="flex items-center h-full w-full justify-center bg-gray-100">
      <div className="text-center">
        <svg
          className="mx-auto mb-4 text-gray-400"
          width="50"
          height="50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19V6l-2.293 2.293a1 1 0 001.414 1.414L12 5l3.879 3.879a1 1 0 001.414-1.414L15 6v13"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No PDF Available
        </h3>
        <p className="text-gray-500">
          The PDF you're looking for doesn't seem to be available. Check the URL
          or try again later.
        </p>
      </div>
    </div>
  );
};
