"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { TertiaryText } from "./TertiaryText";
import SquareIconButton from "./SqaureIconButton";
import { ArrowUpIcon } from "@heroicons/react/16/solid";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  label?: string;
  placeholder: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  isValid?: boolean;
  validationMessage?: string;
  characterLimit?: number;
}

export default function SimpleTextInput({
  value,
  label,
  placeholder,
  onChange,
  onSubmit,
  isValid,
  validationMessage,
  characterLimit,
}: Props) {
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange && onChange(e.target.value);
  };

  return (
    <div
      className={classNames(
        "w-full flex flex-col gap-2 bg-base-100 border-2 border-base-content/20 rounded-md relative",
        value.length > characterLimit ? "border-warning" : undefined
      )}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {label && <TertiaryText value={label} />}
      <div className={"w-full flex flex-col rounded-md bg-base-100 px-4 py-1"}>
        <div className="w-full flex gap-2 items-center">
          <textarea
            autoFocus
            placeholder={placeholder}
            value={value}
            rows={1}
            onChange={handleInputChange}
            className="textarea w-full max-h-32 min-h-32 rounded-none resize-none bg-inherit text-white placeholder-base-content/30 focus:ring-0 focus:outline-none border-none p-0"
          ></textarea>

          {onSubmit && (
            <SquareIconButton
              disabled={!isValid}
              icon={<ArrowUpIcon className="h-4 w-4" />}
              onClick={() => {
                onSubmit(value);
              }}
            />
          )}
        </div>
      </div>

      {characterLimit && value.length > characterLimit && (
        <div className="absolute bottom-2 left-2 flex gap-2 items-center bg-base-100/90 backdrop-blur-sm px-2 py-1 rounded-md border border-base-content/80">
          <p
            className={classNames(
              "text-white text-xs",
              value.length >= characterLimit ? "font-bold" : undefined
            )}
          >
            <span
              className={
                value.length >= characterLimit ? "text-warning" : undefined
              }
            >
              {value.length}
            </span>
            {` / ${characterLimit}`}
          </p>

          {value.length > characterLimit && (
            <p className="text-xs font-bold text-warning">
              {validationMessage ||
                `Input limit exceeded, results limited to ${characterLimit} characters`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
