import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CodeEditor from "./CodeEditor";
import MarkdownEditor from "./MarkdownEditor";
import FileUpload from "./FileUpload";
import { CONTENT_TYPES, LANGUAGE_TYPES, MARKDOWN_TYPES } from "@/lib/item-type-constants";

interface ItemTypeFieldsProps {
  typeName: string;
  content: string;
  onContentChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  url: string;
  onUrlChange: (value: string) => void;
  idPrefix: string;
  fileUpload?: {
    onUploadComplete: (data: { fileUrl: string; fileName: string; fileSize: number }) => void;
    onError: (msg: string) => void;
  };
}

export default function ItemTypeFields({
  typeName,
  content,
  onContentChange,
  language,
  onLanguageChange,
  url,
  onUrlChange,
  idPrefix,
  fileUpload,
}: ItemTypeFieldsProps) {
  const typeLower = typeName.toLowerCase();
  const showContent = CONTENT_TYPES.includes(typeLower);
  const showLanguage = LANGUAGE_TYPES.includes(typeLower);
  const showUrl = typeLower === "link";
  const showFileUpload = (typeLower === "file" || typeLower === "image") && fileUpload;

  return (
    <>
      {showContent && (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-content`}>Content</Label>
          {showLanguage ? (
            <CodeEditor
              value={content}
              onChange={onContentChange}
              language={language || undefined}
            />
          ) : MARKDOWN_TYPES.includes(typeLower) ? (
            <MarkdownEditor
              value={content}
              onChange={onContentChange}
            />
          ) : (
            <Textarea
              id={`${idPrefix}-content`}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Content"
              rows={6}
              className="font-mono text-sm"
            />
          )}
        </div>
      )}

      {showLanguage && (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-language`}>Language</Label>
          <Input
            id={`${idPrefix}-language`}
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            placeholder="e.g. javascript, python"
          />
        </div>
      )}

      {showUrl && (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-url`}>URL</Label>
          <Input
            id={`${idPrefix}-url`}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://..."
            type="url"
            required
          />
        </div>
      )}

      {showFileUpload && (
        <div className="space-y-1.5">
          <Label>{typeLower === "image" ? "Image" : "File"}</Label>
          <FileUpload
            typeName={typeLower as "file" | "image"}
            onUploadComplete={fileUpload.onUploadComplete}
            onError={fileUpload.onError}
          />
        </div>
      )}
    </>
  );
}
