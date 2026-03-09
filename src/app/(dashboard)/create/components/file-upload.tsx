/* eslint-disable @next/next/no-img-element */

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Eye, X } from "lucide-react";

type FileUploadProps = {
  label?: string;
  uploadMessage: string;
  accept?: string[];
  maxSize?: number; // MB
  value?: File | null;
  onChange?: (file: File | null) => void;
};

export default function FileUpload({
  label,
  uploadMessage,
  accept = ["image/png", "image/jpeg"],
  maxSize = 5,
  value,
  onChange,
}: FileUploadProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange?.(acceptedFiles[0] ?? null);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxSize: maxSize * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium">{label}</p>
      )}

      <Card
        {...getRootProps()}
        className="cursor-pointer border-dashed h-50 flex items-center justify-center"
      >
        <input {...getInputProps()} />

        <CardContent className="flex flex-col items-center gap-2 text-center">
          <Upload className="w-6 h-6" />

          <p className="text-sm font-semibold">
            {isDragActive
              ? "Drop file here..."
              : `Click or drag to upload ${uploadMessage}`}
          </p>

          <p className="text-xs text-muted-foreground">
            {accept.join(", ")} (Max {maxSize}MB)
          </p>
        </CardContent>
      </Card>

      {value && (
        <div className="flex justify-between items-center bg-muted p-2 rounded-md">
          <span className="text-sm truncate">
            {value.name}
          </span>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )}

      {previewOpen && value && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-background p-4 rounded-lg max-w-lg w-full ">
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setPreviewOpen(false)}
            >
              <X />
            </Button>

            {value.type.startsWith("image") ? (
              <img
                src={URL.createObjectURL(value)}
                className="w-full"
                alt="Preview"
              />
            ) : (
              <video
                controls
                src={URL.createObjectURL(value)}
                className="w-full"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}