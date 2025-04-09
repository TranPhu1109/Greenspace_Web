import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const EditorComponent = ({ value, onChange, height = 600 }) => {
  return (
    <Editor
      apiKey="f1fuj95hvzni9sacm5akywyv4zpnesg0ntwyv1wayqfy9ffs"
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: 'file edit view insert format tools table help',
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
          'emoticons', 'codesample', 'template'
        ],
        toolbar:
          `undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | 
          forecolor backcolor | alignleft aligncenter alignright alignjustify | 
          bullist numlist outdent indent | link image media codesample | 
          preview code fullscreen | removeformat help`,
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
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