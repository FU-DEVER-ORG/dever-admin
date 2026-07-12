"use client";

import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Link,
  List,
  Alignment,
  BlockQuote,
  Table,
  TableToolbar,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

const editorConfiguration = {
  // GPL license key for open-source usage (ckeditor5 v44+ requires an explicit key).
  licenseKey: "GPL" as const,
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Link,
    List,
    Alignment,
    BlockQuote,
    Table,
    TableToolbar,
  ],
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "link",
    "|",
    "alignment",
    "bulletedList",
    "numberedList",
    "|",
    "blockQuote",
    "insertTable",
  ],
};

interface CustomEditorInterface {
  getData: (value: string) => void;
  data?: string;
}

const CustomEditor = ({ getData, data }: CustomEditorInterface) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      config={editorConfiguration}
      data={data}
      onChange={(_, editor) => {
        const value = editor?.getData();
        getData(value);
      }}
    />
  );
};

export default CustomEditor;
