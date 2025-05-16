import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const EditorComponent = ({ value, onChange, height = 600 }) => {
  return (
    <Editor
      apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
      value={value}
      onEditorChange={onChange}
      init={{
        selector: "textarea",
        onboarding: false,
        height,
        menubar: 'file edit view insert format tools table help',
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
          'emoticons', 'codesample'
        ],
        toolbar:
          `undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | 
          forecolor backcolor | alignleft aligncenter alignright alignjustify | 
          bullist numlist outdent indent | link image media codesample | 
          preview code fullscreen | removeformat help`,
        block_formats:
          'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6;',
        content_style: `
          body {
            font-family:Helvetica,Arial,sans-serif;
            font-size:14px;
            line-height:1.6;
          }

          h1,h2,h3,h4,h5,h6 {
          font-weight: bold;
          margin-top: 1.2em;
          margin-bottom: 0.6em;
          }

          h1 { font-size: 2em; }
          h2 { font-size: 1.75em; }
          h3 { font-size: 1.5em; }
          h4 { font-size: 1.25em; }
          h5 { font-size: 1em; }
          h6 { font-size: 0.875em; }

          p {
            margin: 0.5em 0;
          }
          ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin: 0.5em 0;
          }
          ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin: 0.5em 0;
          }
          li {
            margin-bottom: 0.25em;
          }
          b, strong {
            font-weight: bold;
          }
          i, em {
            font-style: italic;
          }
          a {
            color: #0077cc;
            text-decoration: underline;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 0.5em;
            text-align: left;
          }
        `,
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        file_picker_callback: (cb, value, meta) => {
          if (meta.filetype === 'image') {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.onchange = function () {
              const file = this.files[0];
              const reader = new FileReader();
              reader.onload = function () {
                cb(reader.result, { title: file.name });
              };
              reader.readAsDataURL(file);
            };
            input.click();
          }
        }
      }}
    />
  );
};

export default EditorComponent;