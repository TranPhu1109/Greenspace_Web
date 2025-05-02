import React from 'react';
import EditorJSHTML from 'editorjs-html';

const parser = EditorJSHTML();

const EditorJSRenderer = ({ data }) => {
  if (!data || !data.blocks) return null;

  const parsed = parser.parse(data);

  // Gộp toàn bộ các block HTML thành 1 mảng phẳng
  const htmlElements = Object.values(parsed).flat();

  return (
    <div className="editor-content">
      {htmlElements.map((item, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </div>
  );
};

export default EditorJSRenderer;
